#!/usr/bin/env python3
"""Export this site's NeatCode graph as a laid-out JSON file for the NeatCode demo.

Usage: python3 -I scripts/export-site-graph.py   (from the repo root)

Runs `neatcode sync --force`, reads .neatcode/graph.db, keeps source files under
app/ components/ content/ lib/, aggregates symbol-level edges to file level, and
computes a deterministic force-directed layout (Fruchterman-Reingold) so the
browser does no physics.
"""
import json
import math
import os
import random
import re
import sqlite3
import subprocess
from collections import defaultdict
from datetime import date

ROOT = os.getcwd()
DB = os.path.join(ROOT, ".neatcode", "graph.db")
OUT = os.path.join(ROOT, "content", "generated", "site-graph.json")
KEEP = re.compile(r"^(app|components|content|lib)/")
WIDTH, HEIGHT, PAD = 600, 360, 28


def sync_seconds():
    out = subprocess.run(["neatcode", "sync", "--force"], capture_output=True, text=True, check=True)
    m = re.search(r"in ([\d.]+)s", out.stdout + out.stderr)
    return float(m.group(1)) if m else 0.0


def group_of(path):
    return path.split("/", 1)[0]


def layout(ids, edges, seed=7, iterations=400):
    rnd = random.Random(seed)
    pos = {i: [rnd.uniform(0, WIDTH), rnd.uniform(0, HEIGHT)] for i in ids}
    k = math.sqrt((WIDTH * HEIGHT) / max(len(ids), 1)) * 0.75
    temp = WIDTH / 8
    for _ in range(iterations):
        disp = {i: [0.0, 0.0] for i in ids}
        for a in ids:
            for b in ids:
                if a == b:
                    continue
                dx, dy = pos[a][0] - pos[b][0], pos[a][1] - pos[b][1]
                d = max(math.hypot(dx, dy), 0.01)
                f = k * k / d
                disp[a][0] += dx / d * f
                disp[a][1] += dy / d * f
        for s, t in edges:
            dx, dy = pos[s][0] - pos[t][0], pos[s][1] - pos[t][1]
            d = max(math.hypot(dx, dy), 0.01)
            f = d * d / k
            disp[s][0] -= dx / d * f
            disp[s][1] -= dy / d * f
            disp[t][0] += dx / d * f
            disp[t][1] += dy / d * f
        for i in ids:
            # Gravity toward the centre keeps loosely connected clusters on the canvas.
            disp[i][0] -= (pos[i][0] - WIDTH / 2) * 0.06
            disp[i][1] -= (pos[i][1] - HEIGHT / 2) * 0.06
        for i in ids:
            dx, dy = disp[i]
            d = max(math.hypot(dx, dy), 0.01)
            pos[i][0] += dx / d * min(d, temp)
            pos[i][1] += dy / d * min(d, temp)
        temp *= 0.985
    xs = [p[0] for p in pos.values()]
    ys = [p[1] for p in pos.values()]
    sx = (WIDTH - 2 * PAD) / max(max(xs) - min(xs), 1)
    sy = (HEIGHT - 2 * PAD) / max(max(ys) - min(ys), 1)
    return {
        i: (round(PAD + (p[0] - min(xs)) * sx, 1), round(PAD + (p[1] - min(ys)) * sy, 1))
        for i, p in pos.items()
    }


def main():
    seconds = sync_seconds()
    db = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
    files = [
        r[0]
        for r in db.execute("select file_path from files where parse_status = 'ok' order by 1")
        if KEEP.match(r[0]) and os.path.exists(os.path.join(ROOT, r[0]))
    ]
    keep = set(files)
    symbols = defaultdict(list)
    for name, path in db.execute("select name, file_path from nodes where kind != 'file' order by line_start"):
        if path in keep:
            symbols[path].append(name)

    pair_kinds = defaultdict(set)
    for kind, src, tgt in db.execute("select kind, source_qualified, target_qualified from edges where kind != 'contains'"):
        s, t = src.split("::", 1)[0], tgt.split("::", 1)[0]
        if s in keep and t in keep and s != t:
            pair_kinds[(s, t)].add(kind)

    # Files with no links to other site files add nothing to the picture.
    linked = {f for pair in pair_kinds for f in pair}
    files = [f for f in files if f in linked]
    pos = layout(files, list(pair_kinds))
    graph = {
        "generatedAt": date.today().isoformat(),
        "stats": {
            "files": len(files),
            "symbols": sum(len(v) for v in symbols.values()),
            "edges": len(pair_kinds),
            "indexSeconds": seconds,
        },
        "nodes": [
            {
                "id": f,
                "label": f.split("/", 1)[1],
                "group": group_of(f),
                "x": pos[f][0],
                "y": pos[f][1],
                "symbols": symbols[f],
            }
            for f in files
        ],
        "edges": [
            {"source": s, "target": t, "kinds": sorted(k)} for (s, t), k in sorted(pair_kinds.items())
        ],
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as fh:
        json.dump(graph, fh, indent=1)
        fh.write("\n")
    print(f"{OUT}: {graph['stats']}")


if __name__ == "__main__":
    main()
