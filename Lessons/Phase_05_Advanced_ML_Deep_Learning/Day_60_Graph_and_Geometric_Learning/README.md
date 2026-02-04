---
day: 60
title: "Graph & Geometric Learning"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "graph-learning"
duration: 55
difficulty: "advanced"
tags: [deep-learning, graphs, gnn, networks]
concepts: [graph neural networks, node embeddings, social networks]
prerequisites: [46]
outcomes: [Understand graph structures, Apply GNNs, Analyze network data]
---

# 🎯 Day 60: Graph & Geometric Learning

> *"When your data has relationships: social networks, molecules, knowledge graphs."*

---

## The Technical Deep Dive

### Graph Basics

```python
import networkx as nx

G = nx.Graph()
G.add_edges_from([(1, 2), (1, 3), (2, 3), (3, 4)])

# Graph properties
print(f"Nodes: {G.number_of_nodes()}")
print(f"Edges: {G.number_of_edges()}")
print(f"Degree of node 3: {G.degree(3)}")
```

### Node Embeddings (Node2Vec)

```python
from node2vec import Node2Vec

node2vec = Node2Vec(G, dimensions=64, walk_length=30, num_walks=200)
model = node2vec.fit()

# Get embedding for node 1
embedding = model.wv[1]
```

### GNN with PyTorch Geometric

```python
import torch
from torch_geometric.nn import GCNConv

class GCN(torch.nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.conv1 = GCNConv(in_channels, 16)
        self.conv2 = GCNConv(16, out_channels)
    
    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index).relu()
        x = self.conv2(x, edge_index)
        return x
```

---

## Summary

- ✅ Graphs model relationships
- ✅ Node embeddings capture structure
- ✅ GNNs learn from graph topology

**🎉 Congratulations!** You've completed **Phase 5: Advanced ML & Deep Learning**!
