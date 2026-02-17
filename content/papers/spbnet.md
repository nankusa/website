---
title: "A Data-Efficient Foundation Model for Porous Materials via Expert-Guided Supervised Learning"
description: "SpbNet demonstrates that expert knowledge—encoded through potential energy surface basis functions and multi-scale geometric pre-training—can reduce data requirements by 20× while achieving superior performance across 50+ downstream tasks spanning MOFs, COFs, PPNs, and zeolites."
date: "2026-02-11"
tags: ["foundation model", "porous materials", "data efficiency", "expert knowledge", "Nature Communications", "MOF", "COF", "zeolite"]
authors: ["Jiawen Zou", "Zirui Lv", "Weimin Tan", "Taoyang Wang", "Runfeng Lin", "Zhongyao Wang", "Yi Yang", "Qiaowei Li", "Xiaomin Li", "Bo Yan", "Dongyuan Zhao"]
journal: "Nature Communications"
year: 2026
doi: "10.1038/s41467-026-69245-y"
citationCount: 0
demoUrl: "/demo/spbnet"
paperUrl: "https://www.nature.com/articles/s41467-026-69245-y"
supersededBy:
  slug: "spatialread"
  title: "From atom to space: A region-based readout function for spatial properties of materials"
  note: "This work has been superseded by [SpatialRead](/papers/spatialread), which employs **spatial node features** in lieu of molecular force field calculations. Our subsequent analysis indicates that the principal advantage of force field-based approaches lies not in their empirical parameterization, but in the **regional decomposition** of target properties—treating gas adsorption capacity, for instance, as an integral over spatial sub-regions rather than a sum over atomic contributions.\n\nSpatialRead achieves **superior performance without pre-training** (Nevertheless, we haven't tried the expert-guided pre-training as in SpbNet for SpatialRead) and permits the **complete removal** of the Transformer architecture for task-specific applications (e.g., gas adsorption, separation and most guest-molecule-related tasks of MOFs), retaining only the GNN component. We recommend SpatialRead for practical deployments."
---

# Expert Knowledge Beats Big Data: A 20× Data-Efficient Foundation Model for Porous Materials

## The Data Efficiency Paradox in Materials Science

Foundation models have transformed natural language processing, computer vision, and increasingly, scientific domains. Their recipe seems universal: pre-train on massive datasets, then fine-tune on downstream tasks. In materials science, however, this recipe encounters a fundamental obstacle—**data is scarce and expensive**.

Consider zeolites: despite decades of research, fewer than 1,000 experimental structures exist. Even for metal-organic frameworks (MOFs), where computational screening has generated hundreds of thousands of hypothetical structures, high-quality labeled data for specific properties remains limited. The standard foundation model playbook—accumulate ever-larger datasets—hits a wall.

Yet materials science possesses something that NLP and vision do not: **decades of accumulated physical and chemical knowledge**. Specifically, for MOFs, force fields describe molecular interactions, geometric analysis characterizes pore structures. These principles are universal, well-validated, and underutilized in machine learning.

SpbNet (Structure-informed Potential energy surface Basis function Network) demonstrates that expert knowledge, properly encoded, can substitute for data volume. Pre-trained on merely **100,000 MOF structures**, SpbNet outperforms models trained on [1.9 million porous materials](https://www.nature.com/articles/s42256-023-00628-2) and even [120 million molecular and material samples](https://proceedings.iclr.cc/paper_files/paper/2024/hash/4a896a8bb065774169d9ad65f19208b7-Abstract-Conference.html).

## The Three Pillars of Expert-Guided Learning

### Pillar 1: Physics-Informed Descriptors—PES Basis Functions

The interaction between a guest molecule and a porous material determines adsorption, separation, and storage properties. Standard approaches either (1) train the model to discover these interactions from scratch, or (2) use molecule-specific potential energy surfaces (PES) that fail to generalize across different guests.

SpbNet takes a third path: **decompose the PES into physically meaningful basis functions** derived from first-principles force fields.

#### Derivation

The non-bonded interaction between a material atom $i$ and a probe atom $j$ follows the Lennard-Jones potential with Coulomb correction:

$$E_{\text{pauli}}(i,j) = 4\epsilon_{ij}\left(\frac{\sigma_{ij}}{r_{ij}}\right)^{12}, \quad E_{\text{london}}(i,j) = -4\epsilon_{ij}\left(\frac{\sigma_{ij}}{r_{ij}}\right)^6, \quad E_{\text{coulomb}}(i,j) = \frac{kq_iq_j}{r_{ij}}$$

The parameters $\epsilon$ and $\sigma$ denote the well depth and the van der Waals radius, respectively, which depend on the specific (pseudo) atoms. $q$ represents the partial charge, and $k=\frac{1}{4\pi\epsilon_0}$ is the electrostatic force constant. Using Lorentz-Berthelot mixing rules ($\sigma_{ij} = (\sigma_i + \sigma_j)/2$, $\epsilon_{ij} = \sqrt{\epsilon_i\epsilon_j}$) and applying the binomial theorem to expand $(\sigma_i + \sigma_j)^n$, we can express the total potential energy of any guest molecule $\phi$ as a **linear combination of material-dependent basis functions** with molecule-specific coefficients:

$$E_{\phi}(\mathbf{r}) = \sum_{i=1}^{13} E_{\text{pauli}}^i(\mathbf{r}) \cdot \text{Coe}_{\text{pauli}}^i(\phi) + \sum_{i=1}^{7} E_{\text{london}}^i(\mathbf{r}) \cdot \text{Coe}_{\text{london}}^i(\phi) + E_{\text{coulomb}}(\mathbf{r}) \cdot \text{Coe}_{\text{coulomb}}(\phi)$$

The resulting **20 PES basis functions** (13 Pauli repulsion + 7 London dispersion + 1 Coulomb potential) provide a **universal, transferable representation** of guest-host interactions. These basis functions are:

| Term | Formula | Physical Meaning |
|------|---------|------------------|
| $E_{\text{pauli}}^{k}$ | $\sum_{i \in M} \frac{4\sqrt{\epsilon_i\epsilon_j}}{(2r)^{12}} C_{12}^{k}(\sigma_i + \sigma_j)^{k}$ | Exchange-repulsion (order $k$) |
| $E_{\text{london}}^{k}$ | $-\sum_{i \in M} \frac{4\sqrt{\epsilon_i\epsilon_j}}{(2r)^{6}} C_{6}^{k}(\sigma_i + \sigma_j)^{k}$ | Dispersion (order $k$) |
| $E_{\text{coulomb}}$ | $\frac{kq_iq_j}{r}$ | Coulomb potential |

**Key insight**: The basis functions depend only on the material structure and a reference probe (methane), while the coefficients depend only on the guest molecule. This separation enables zero-shot transfer to new adsorbates.

#### Residual Connection Design

The PES basis functions are implemented with a residual connection:

$$E_{\text{universal}} = E_{\text{CH}_4} + \text{Linear}(E_{\text{pauli}}^{0..12}, E_{\text{london}}^{0..6})$$

Note that the coulomb potential is omitted, since they can result in wrong inductive bias for nonpolar molecules like N2, O2. The original methane PES serves as the identity mapping, with basis functions providing correction terms. This design—analogous to ResNet's skip connections—stabilizes training and improves performance.

### Pillar 2: Multi-Modal Architecture

![Overall training pipeline of SpbNet](/images/papers/spbnet/figure_1.png)
*Figure 1: SpbNet architecture. (1) Descriptors: Raw structure + 20-channel PES basis functions. (2) Dual-stream encoder: GNN for structure, ViT for PES. (3) Cross-attention fusion. (4) Multi-scale pre-training: global geometric features + local atom-level properties. (5) Fine-tuning on downstream tasks.*

SpbNet processes two complementary modalities:

**Structure Stream (GNN)**:
- PaiNN backbone processes raw atomic structure
- Captures bond lengths, angles, local coordination environments
- Outputs: Set of atomic embeddings $\{h_{v_i}\}$

**Energy Stream (Vision Transformer)**:
- PES basis functions evaluated on $24 \times 24 \times 24$ grid
- 20-channel 3D image linearly combined to single-channel
- Patchified into $512$ tokens ($3 \times 3 \times 3$ patches)
- 36-layer Transformer with learnable [CLS] token

**Cross-Attention Fusion**:
- Structural embeddings inject into PES token stream via cross-attention
- Enables dynamic interaction: structure guides energy interpretation
- Preserves modality-specific representations while enabling information flow

**Why dual-stream?** Single-stream architectures force the same layers to process heterogeneous inputs. Dual-stream allows specialization: GNN layers excel at irregular atomic graphs; Transformer layers excel at regular grid-structured PES. Cross-attention provides flexible fusion without sacrificing representational diversity.

### Pillar 3: Multi-Scale Geometric Pre-training

Pre-training tasks encode established geometric analysis methods:

| Scale | Task | Physical Significance |
|-------|------|----------------------|
| **Global** | Topology type (pcu, fcu, etc.) | Network connectivity pattern |
| **Global** | Pore Limiting Diameter (PLD) | Minimum opening for guest entry |
| **Global** | Largest Cavity Diameter (LCD) | Maximum void space |
| **Global** | Void Fraction (VF) | Empty space / total volume |
| **Global** | Accessible Surface Area (ASA) | Surface available to probes |
| **Local** | Atom Number per PES patch | Local density |
| **Local** | Signed Distance Function (SDF) | Distance to nearest surface |

**Multi-probe strategy**: ASA, VF, and SDF are computed with probes of varying sizes (0.5 Å and 2.0 Å), ensuring the model learns scale-invariant geometric features rather than probe-specific biases.

## Pre-training Results: Learning Geometry

![Pre-training results](/images/papers/spbnet/figure_2.png)
*Figure 2: (a-b) SpbNet achieves $R^2 > 0.9$ and Pearson $r > 0.95$ on global geometric features. (c-d) t-SNE visualizations show PES patch embeddings organize by atom count and SDF, confirming local feature learning.*

Pre-training performance validates that SpbNet successfully learns geometric representations

The t-SNE visualizations (Fig. 2c-d) reveal that PES patch embeddings naturally organize by atom count and SDF value, even though these were learned jointly through multi-task training. This demonstrates that the model extracts physically meaningful local features.

## Downstream Evaluation: 50+ Tasks

### In-Distribution: MOF Property Prediction

![Prediction error distributions across diverse tasks](/images/papers/spbnet/figure_3.png)
*Figure 3: MAE box plots indicates that SpbNet consistently outperforms baselines across gas adsorption, separation, and intrinsic property tasks. The main baseline is [MOFTransformer]((https://www.nature.com/articles/s42256-023-00628-2))/[PMTransformer](https://pubs.acs.org/doi/10.1021/acsami.3c10323).*

### Out-of-Distribution: Cross-Material Generalization

![Generalization on out-of-distribution materials](/images/papers/spbnet/figure_4.png)
*Figure 4: SpbNet generalizes to COFs (Fig. a & c), PPNs (Fig. d), and zeolites (Fig. b & e)—material classes never seen during pre-training.*

### Label Efficiency: Less Data, Better Performance

![Label Efficiency](/images/papers/spbnet/figure_5.png)
*Figure 5: With limited downstream training data, SpbNet maintains superior performance. Even with 5,000 labels, SpbNet outperforms MOFTransformer/PMTransformer trained on 15,000 labels.*

## Limitations and Future Directions

SpbNet's supervised, geometry-focused approach has limitations:

1. **Task specificity**: Properties weakly linked to geometry (e.g., electronic structure, bandgap) benefit less from geometric pre-training. For these tasks, SpbNet relies on its structural encoder and multi-modal flexibility.

2. **Chemical diversity**: While SpbNet generalizes across porous material classes, extremely different chemistries (e.g., metals, ceramics) can be unsuitable.

3. **Multi-atom guests**: Current PES basis functions describe single-atom probes. Extension to multi-atom molecules (with rotational degrees of freedom) remains future work. However, as in our next work [SpatialRead](/papers/spatialread), replacing the whole PES with GNN feature of spatial nodes can be a better choice.

## Conclusion

SpbNet challenges the prevailing assumption that foundation models require ever-larger datasets. In scientific domains with rich theoretical foundations, properly encoded expert knowledge can be more valuable than raw data volume.

The recipe is transferable: identify universal physical principles, decompose them into learnable components and training objectives, finally design architectures that takes correct input and (pre)training tasks. For porous materials, this can be molecular force fields for interactions and geometry for structure.

The broader implication: in data-scarce scientific domains, the path to powerful foundation models may lie both in accumulating more data and better encoding what we already know.

[Read the full paper on Nature Communications](https://www.nature.com/articles/s41467-026-69245-y) · [Try the Demo](/demo/spbnet)
