# RÈGLES DE DÉVELOPPEMENT - Bridge Generator

## RÈGLE ABSOLUE

**ON NE TOUCHE JAMAIS AUX CAS 2 ET 3 SECTIONS**

Ces cas sont finalisés et optimisés. Toute modification doit être spécifique au cas 1 section uniquement.

## CSS - Modifications autorisées

### ✅ AUTORISÉ
- Ajouter des règles CSS spécifiques avec `.single-section`
- Modifier uniquement le comportement du cas 1 section

### ❌ INTERDIT
- Toucher aux règles générales `.sections-grid.two-sections` ou `.sections-grid.three-sections`
- Modifier les règles générales `.table-card`, `.section-container` sans spécifier `.single-section`
- Changer les gaps, margins, heights des cas 2 et 3 sections

## Structure finalisée

### Cas 2 sections
- Gap : 40px
- Margin-bottom cartes : 3px
- Largeur sections : 50% chacune

### Cas 3 sections
- Gap : 25px
- Margin-bottom cartes : 3px
- Largeur sections : 32% chacune

### Cas 1 section (modifiable)
- Une section A avec bandeau
- Affichage sur 2 colonnes internes
- Tables 1-10 à gauche, 11+ à droite
- Hauteur cartes : 70px (spécifique)