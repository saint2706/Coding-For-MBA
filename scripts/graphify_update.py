#!/usr/bin/env python3
"""Incremental, AST-only graphify update for src/.

Re-extracts structure for changed/deleted code files and rebuilds
graphify-out/graph.json, GRAPH_REPORT.md, and graph.html. This mirrors the
code-only path of the `/graphify --update` skill and needs no LLM calls, so
it is safe to run unattended in CI.

Doc/paper/image changes still require a manual `/graphify src --update`
session (semantic extraction needs a language model) - this script only
warns when it detects those.
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "src"
OUT = ROOT / "graphify-out"


def main() -> int:
    from graphify.analyze import god_nodes, suggest_questions, surprising_connections
    from graphify.build import build_from_json
    from graphify.cluster import cluster, score_all
    from graphify.detect import detect_incremental, save_manifest
    from graphify.export import to_html, to_json
    from graphify.extract import extract
    from graphify.report import generate
    from networkx.readwrite import json_graph

    OUT.mkdir(exist_ok=True)

    result = detect_incremental(TARGET)
    new_files = result.get("new_files", {})
    deleted_files = set(result.get("deleted_files", []))
    all_changed = [f for files in new_files.values() for f in files]

    if not all_changed and not deleted_files:
        print("[graphify update] No files changed since last run. Nothing to do.")
        return 0

    non_code = {
        ftype: files
        for ftype, files in new_files.items()
        if ftype != "code" and files
    }
    if non_code:
        counts = ", ".join(f"{len(v)} {k}" for k, v in non_code.items())
        print(
            f"[graphify update] {counts} changed - semantic extraction needs an "
            "LLM session. Run `/graphify src --update` manually to pick those up. "
            "Continuing with AST-only extraction for code changes."
        )

    code_files = [Path(f) for f in new_files.get("code", [])]
    if code_files:
        extraction = extract(code_files)
        print(f"AST: {len(extraction['nodes'])} nodes, {len(extraction['edges'])} edges")
    else:
        extraction = {"nodes": [], "edges": [], "input_tokens": 0, "output_tokens": 0}
        print("[graphify update] No code files changed - nothing to re-extract.")

    graph_path = OUT / "graph.json"
    old_node_labels: dict[str, str] = {}
    if graph_path.exists():
        existing_data = json.loads(graph_path.read_text(encoding="utf-8"))
        old_node_labels = {
            n["id"]: n["community_name"]
            for n in existing_data.get("nodes", [])
            if n.get("community_name")
        }
        G = json_graph.node_link_graph(existing_data, edges="links")
    else:
        import networkx as nx

        G = nx.Graph()

    if deleted_files:
        to_remove = [
            n for n, d in G.nodes(data=True) if d.get("source_file") in deleted_files
        ]
        G.remove_nodes_from(to_remove)
        print(f"Pruned {len(to_remove)} ghost node(s) from {len(deleted_files)} deleted file(s).")

    G_new = build_from_json(extraction)
    G.update(G_new)
    print(f"Merged: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

    save_manifest(result["files"])

    communities = cluster(G)
    cohesion = score_all(G, communities)
    gods = god_nodes(G)
    surprises = surprising_connections(G, communities)

    # Louvain community IDs are not stable across reruns, so a new community
    # only inherits an old plain-language label when a clear majority of its
    # members carried that same label before this update. Communities
    # without a clear majority - new or heavily reshuffled clusters - fall
    # back to a generic name; naming those well is an LLM task for an
    # interactive `/graphify --update` session, not this unattended run.
    labels: dict[int, str] = {}
    for cid, members in communities.items():
        old_label_counts: dict[str, int] = {}
        for member in members:
            old_label = old_node_labels.get(member)
            if old_label:
                old_label_counts[old_label] = old_label_counts.get(old_label, 0) + 1
        if old_label_counts:
            best_label, best_count = max(old_label_counts.items(), key=lambda kv: kv[1])
            if best_count / len(members) >= 0.6:
                labels[cid] = best_label
                continue
        labels[cid] = f"Community {cid}"

    questions = suggest_questions(G, communities, labels)
    detection = {
        "total_files": sum(len(v) for v in result.get("files", {}).values()),
        "total_words": 0,
        "needs_graph": True,
        "warning": None,
        "files": {"code": [], "document": [], "paper": []},
    }
    tokens = {
        "input": extraction.get("input_tokens", 0),
        "output": extraction.get("output_tokens", 0),
    }
    report = generate(
        G, communities, cohesion, labels, gods, surprises, detection, tokens, "src",
        suggested_questions=questions,
    )
    (OUT / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")
    to_json(G, communities, str(graph_path), community_labels=labels)
    (OUT / ".graphify_labels.json").write_text(
        json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False),
        encoding="utf-8",
    )

    if G.number_of_nodes() > 5000:
        print(f"Graph has {G.number_of_nodes()} nodes - skipping HTML viz.")
    else:
        to_html(G, communities, str(OUT / "graph.html"), community_labels=labels or None)
        print("graph.html written")

    cost_path = OUT / "cost.json"
    cost = (
        json.loads(cost_path.read_text(encoding="utf-8"))
        if cost_path.exists()
        else {"runs": [], "total_input_tokens": 0, "total_output_tokens": 0}
    )
    cost["runs"].append(
        {
            "date": datetime.now(timezone.utc).isoformat(),
            "input_tokens": tokens["input"],
            "output_tokens": tokens["output"],
            "files": len(code_files),
        }
    )
    cost["total_input_tokens"] += tokens["input"]
    cost["total_output_tokens"] += tokens["output"]
    cost_path.write_text(json.dumps(cost, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities")
    return 0


if __name__ == "__main__":
    sys.exit(main())
