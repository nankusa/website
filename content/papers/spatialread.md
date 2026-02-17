---
title: "From Atom to Space: A Region-Based Readout Function for Spatial Properties of Materials"
description: "SpatialRead introduces a region-based decomposition perspective for material property prediction, reformulating graph-level properties as integrals over space rather than sums over atoms—enabling superior performance on spatial properties like gas adsorption without sacrificing generality."
date: "2026-01-26"
tags: ["materials science", "GNN", "readout function", "spatial properties", "ICLR", "porous materials"]
authors: ["Jiawen Zou", "Zhongyao Wang", "Hao Qi", "Weimin Tan", "Bo Yan"]
journal: "ICLR"
year: 2026
doi: ""
citationCount: 0
paperUrl: "https://openreview.net/forum?id=v2oYZJ7Exo"
featured: true
---

# From Atom to Space: A Region-Based Readout Function for Spatial Properties of Materials

## The Hidden Assumption in Graph Neural Networks

Message Passing Neural Networks (MPNNs) have become the de facto standard for material property prediction. At their core lies an implicit assumption: material properties decompose into contributions from individual atoms. This *atom-decomposable inductive bias* is expressed as:

$$h_{\text{graph}} = \sum_{v_i \in V} f(h_{v_i})$$

where $h_{v_i}$ are node features and $f$ is the readout function. While this formulation works well for many properties (total energy, bandgap, etc.), it fundamentally misaligns with *spatial properties*—quantities that naturally integrate over regions of space rather than summing over atomic contributions.

Consider gas adsorption capacity in metal-organic frameworks (MOFs). Physically, adsorption occurs in pore regions, not at atomic sites. The total capacity equals the integral of gas density over all spatial regions where adsorption can occur. Yet standard GNNs force this property through an atomic decomposition bottleneck.

## Empirical Evidence: What GNNs Actually Learn

To understand how standard GNNs handle spatial properties, we trained a PaiNN model on MOF adsorption tasks and analyzed per-atom contributions using numeric-level pooling. The results reveal a striking pattern:

![Contribution of atoms for the adsorption capacity predicted by GNN](/images/papers/spatialread/motivation.png)
*Figure 1: (A) Atom contributions correlate strongly with proximity to pore surfaces. (B) High-contribution atoms (red stars, top 5%) cluster exclusively around pore channels. Analysis based on 100 MOFs from CoREMOF.*

**Key finding**: Among the top 1% of atoms with highest contribution scores, **86% lie within 0.05 Å of pore surfaces**. The model is implicitly learning what it should have been told explicitly: spatial properties depend on spatial regions, not just atoms.

This observation motivates a fundamental question: *If standard GNNs must implicitly learn spatial regions through their atomic representations, why not provide explicit spatial representations?*

## From Node Decomposition to Spatial Integration

### Theoretical Foundation

We reformulate material properties using a *region-based decomposition*. Instead of summing over atoms, we integrate over space:

$$h_{\text{graph}} = \int_{\mathbb{R}^3} g(\mathbf{r} \mid \mathcal{S}) \, d^3\mathbf{r} = \int_{\mathbb{R}^3} g(\mathcal{N}(\mathbf{r})) \, d^3\mathbf{r}$$

where $g(\mathbf{r} \mid \mathcal{S})$ is a contribution function over spatial position $\mathbf{r}$ given structure $\mathcal{S}$, and $\mathcal{N}(\mathbf{r})$ denotes the local neighborhood of $\mathbf{r}$.

**Definition (Spatial Property)**: A property $p$ is a *spatial property* if it can be expressed as a functional of a contribution function $g(\mathbf{r} \mid \mathcal{S})$. Examples include:
- Gas adsorption capacity (gas density integrated over pore volume)
- Accessible surface area
- Pore limiting diameter
- Void fraction
- Adsorption selectivity ratios

### Equivalence Theorem

A natural concern: does this reformulation limit expressivity? We prove that under limited receptive fields, the two formulations are equivalent:

> **Theorem 1** (Equivalence under Limited Receptive Field): If the readout function $f$ has a limited receptive field, the node-decomposable formulation $h_{\text{graph}} = \sum f(h_{v_i} \mid H)$ and the spatial-integral formulation $h_{\text{graph}} = \int g(\mathbf{r}) \, d^3\mathbf{r}$ are equivalent in expressivity.

*Proof sketch*: 
- **Node → Space**: Define $g(\mathbf{r}) = \sum_{v_i} h'_{v_i} \delta(\mathbf{r} - \mathbf{pos}_i)$ using Dirac delta functions. The integral recovers the sum.
- **Space → Node**: For any spatial contribution function $g(\mathbf{r})$, define normalized weights $w_i(\mathbf{r})$ over nearby atoms such that $\sum_i w_i(\mathbf{r}) = 1$. Then:
  $$\int g(\mathbf{r}) \, d^3\mathbf{r} = \sum_{v_i} \int_{\|\mathbf{r}-\mathbf{pos}_i\|<r_g} g(\mathbf{r}) w_i(\mathbf{r}) \, d^3\mathbf{r}$$

This equivalence is crucial: it guarantees that adopting a spatial perspective does not sacrifice representational power. The reformulation is purely a matter of *inductive bias*—guiding the model toward physically plausible solutions.

## SpatialRead: Architecture and Implementation

### Core Design

SpatialRead introduces **spatial nodes** that represent discretized regions of space, transforming the conventional atomic graph into a heterogeneous atom-space graph:

![Architecture of SpatialRead](/images/papers/spatialread/main.png)
*Figure 2: SpatialRead architecture. (Top) Atomic graph with message passing. (Botton) Spatial nodes (red triangles) added on a voxelized grid. Heterogeneous graph with unidirectional atom→space message flow, processed by a multimodal Transformer decoder.*

**Key components**:

1. **Spatial Node Placement**: Spatial nodes are placed on a uniform $M \times M \times M$ grid within the unit cell:
   $$\mathbf{r}_s(i,j,k) = \left( \frac{i}{M}, \frac{j}{M}, \frac{k}{M} \right), \quad i,j,k = 0,\dots,M-1$$
   We recommend $M=8$ (512 spatial nodes) as a balance between resolution and computational cost for a typical MOF.

2. **Heterogeneous Graph Construction**:
   - **Atom-atom edges**: Standard distance-based edges for message passing
   - **Atom-space edges**: Unidirectional edges from atoms to spatial nodes within cutoff $r_{\text{cut}}$
   - **No space-atom edges**: Information flows atoms → space, not vice versa

3. **Message Passing**: Can be different GNNs:
   $$h_{v_i}^{t+1} = U_t\left(h_{v_i}^t, \{h_{v_j}^t, e_{v_i,v_j}\}_{v_j \in \mathcal{N}(v_i)}, \{h_{s_k}^t, e_{v_i,s_k}\}_{s_k \in \mathcal{N}(v_i)}\right)$$

4. **Multimodal Fusion**: A Transformer decoder processes both atomic and spatial features:
   - Learnable positional embeddings encode spatial node positions
   - [CLS] token aggregates information for prediction
   - Cross-attention enables adaptive selection between atomic and spatial representations

### Why Multimodal Fusion?

Not all properties are spatial. To maintain performance on non-spatial tasks (e.g., formation energy, bandgap), SpatialRead uses attention-based multimodal fusion. The model learns to dynamically weight atomic versus spatial contributions based on the property being predicted. This provides **adaptive inductive bias selection**—the model uses spatial decomposition when appropriate, and atomic decomposition otherwise.

Nevertheless, we do not think the computational overhead is necessary. For most cases, such as gas adsorption capacity, separation ratio, adsorption heat, etc., we recommend simply pooling over spatial nodes rather than the complex Transformer-based readout. This can be critical for materials like MOFs, which have hundreds of atoms in a single lattice.

## Experimental Results

### Benchmark and Datasets

We evaluate SpatialRead on a comprehensive benchmark covering **4 porous material types** and **27 downstream tasks**:

| Dataset | Material | Tasks | Samples |
|---------|----------|-------|---------|
| CoREMOF | MOF | N₂/Ar adsorption | 7,000 |
| CH₄/N2 | MOF | CH₄/N₂ Henry, selectivity | 7,000 |
| C3H6/C3H8 | MOF | Propylene/propane separation | 1,694 |
| PPN | PPN | CH₄ adsorption | 7,000 |
| COF | COF | CH₄/CO₂ adsorption | 7,000 |
| Zeolite | Zeolite | CH₄ adsorption | 7,000 |
| Geo | MOF | Topology, PLD, LCD, VF, ASA | 7,000 |

### Performance on Spatial Properties (Integral Form)

| | Model | MOF C₃H₆/C₃H₈ sep. | MOF N₂ ads. | MOF CH₄/N₂ sep. | COF CH₄ ads. | PPN CH₄ ads. | zeolite CH₄ heat. |
|---|-------|-------------------|-------------|----------------|--------------|--------------|-------------------|
| Scratch | CGCNN | 0.663 | 0.760 | 0.718 | 0.556 | 0.692 | 0.411 |
| | GemNet (JMP from scratch) | 0.729 | 0.968 | 0.924 | 0.816 | 0.932 | 0.836 |
| | GemNet + SN + MM | 0.753 | 0.979 | 0.921 | <u>0.986</u> | 0.923 | 0.881 |
| Pretrain | MOFormer | 0.616 | 0.754 | 0.698 | 0.541 | 0.636 | 0.388 |
| | MOFTransformer | **0.817** | 0.918 | 0.905 | 0.967 | 0.942 | 0.836 |
| | JMP | 0.774 | 0.971 | 0.908 | 0.884 | 0.947 | 0.874 |
| | JMP + SN + MM | 0.792 | **0.988** | **0.941** | 0.982 | 0.969 | <u>0.945</u> |
| Scratch | PaiNN | 0.691 | 0.925 | 0.867 | 0.736 | 0.856 | 0.791 |
| | PaiNN + GraphTrans | 0.712 | 0.912 | 0.870 | 0.750 | 0.847 | 0.801 |
| | PaiNN + GMT | 0.740 | 0.924 | 0.866 | 0.742 | 0.863 | 0.803 |
| | PaiNN + SN (ours) | <u>0.794</u> | 0.978 | <u>0.936</u> | 0.979 | **0.978** | 0.886 |
| | PaiNN + SN + MM (ours) | 0.784 | <u>0.987</u> | **0.941** | **0.987** | <u>0.977</u> | **0.969** |

### Performance on Geometric Properties

| | Model | ASA | VF | PLD | LCD |
|---|-------|-----|----|-----|-----|
| Scratch | CGCNN | 0.984 | 0.883 | 0.536 | 0.565 |
| | GemNet | 0.994 | 0.977 | 0.586 | 0.667 |
| Pretrain | MOFormer | 0.979 | 0.894 | 0.563 | 0.624 |
| | MOFTransformer | 0.916 | <u>0.989</u> | **0.966** | <u>0.970</u> |
| | JMP | <u>0.995</u> | 0.985 | 0.585 | 0.650 |
| Scratch | PaiNN | 0.993 | 0.951 | 0.594 | 0.631 |
| | PaiNN + SN (ours) | 0.974 | **0.999** | 0.856 | 0.913 |
| | PaiNN + SN + MM (ours) | **0.996** | **0.999** | <u>0.965</u> | **0.975** |

**Remarkable result**: A simple PaiNN-Transformer with SpatialRead, trained from scratch without any pre-training, outperforms JMP—a GemNet-based foundation model pre-trained on 120 million samples. This demonstrates that the right architectural inductive bias can be more valuable than massive pre-training.

### Interpretability: What Do Spatial Nodes Capture?

To verify that spatial nodes learn meaningful representations, we visualize high-contribution spatial nodes:

![Visualization of spatial nodes with high contribution](/images/papers/spatialread/spnode_interp.png)
*Figure 3: Spatial nodes with top 10% contributions (red cubes) align with pore channels, confirming they capture physically relevant regions.*

Statistical analysis reveals a striking pattern: **regions with the fewest atoms exhibit the largest contributions**. This is physically intuitive—gas molecules adsorb in empty pore regions, not dense atomic clusters. Standard GNNs must implicitly learn this counter-intuitive mapping; SpatialRead encodes it directly.

### Out-of-Distribution Generalization

A natural way to examine whether a model has learned physically meaningful features is to test its behavior under distribution shift. For a spatial property, although a typical GNN can implicitly infer critical regions from atomic environments, this atom-based decomposition becomes unstable when faced with distribution shift. We test robustness under distribution shift by splitting CoREMOF N₂ adsorption data: the highest-porosity 1/7 of materials are held out as an OOD test set.

![Out-of-distribution Performance](/images/papers/spatialread/ood.png)
*Figure 4: OOD generalization comparison. SpatialRead maintains higher Spearman correlation (0.92 vs. 0.76) under severe distribution shift.*

| Model | In-Dist. Spearman | OOD Spearman |
|-------|-------------------|--------------|
| PaiNN | 0.961 | 0.757 |
| PaiNN + SpatialRead | 0.963 | **0.920** |

SpatialRead preserves ranking stability even when absolute predictions degrade. This is critical for high-throughput screening, where correct material ranking matters more than exact values.

### Computational Cost

The computational overhead is modest (~30-40%) and scales favorably: as system size increases, the fixed number of spatial nodes (512) becomes negligible relative to the growing atom count.

## Key Insights and Contributions

### Theoretical Contributions

1. **Reformulation**: Introduced the spatial-integral perspective for material properties, proving equivalence to node-decomposable formulations under limited receptive fields
2. **Inductive Bias Characterization**: Demonstrated that spatial properties (adsorption, void fraction, pore diameter) require region-based rather than atom-based decomposition

### Architectural Contributions

3. **SpatialRead**: A novel readout function introducing spatial nodes with unidirectional message flow and multimodal adaptive fusion
4. **Adaptive Selection**: The multimodal design enables automatic selection between atomic and spatial inductive biases based on the target property

### Empirical Contributions

1. **State-of-the-art without pre-training**: Outperforms foundation models trained without pre-training
2. **Superior OOD robustness**: Maintains ranking stability under severe distribution shifts
3. Empirical validation on interpretation of working mechanism of conventional GNNs on Spatial Properties and Spatial Nodes

## Implications and Future Directions

As a supplement to current GNNs focusing on designing complex message passing process to imitate atomic-interaction. SpatialRead emphasizes the importance of designing physically-grounded readout function for specific target properties. This can be help in performance, data-efficiency, and OOD generalization. Especially in cases with limited data such as material artificial intelligence, such design is critical.

The framework suggests broader questions: What other inductive biases are we overlooking in materials ML? For those properties with more complex relationship between structures, such as bandgap, what are the correct readout function?

[Read the full paper on OpenReview](https://openreview.net/forum?id=v2oYZJ7Exo)
