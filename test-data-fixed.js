// ====== DONNÉES FIXES - NE JAMAIS MODIFIER ======

function generateTestData() {
    // 35 PAIRES FIXES - Ordre décroissant d'IV total (377 → 38)
    let testData = 'Tournoi Bridge Club Nancy - Test 35 paires du 13/01/2026 à 14:15\n';
    testData += '35 équipe(s)\n';
    testData += 'Nouvelle équipe\n';
    testData += 'Inscription    Joueur 1    Joueur 2    Actions\n';

    // Les 35 paires avec IVs décroissants fixes
    const pairesData = [
        ['MARTIN Pierre', 190, 'BERNARD Marie', 187], // Total: 377
        ['THOMAS Jean', 185, 'DUBOIS Anne', 183], // Total: 368
        ['ROBERT Paul', 180, 'PETIT Claire', 178], // Total: 358
        ['RICHARD Michel', 175, 'MOREAU Sophie', 173], // Total: 348
        ['SIMON Philippe', 170, 'LAURENT Christine', 168], // Total: 338
        ['LEFEVRE Alain', 165, 'MICHEL Brigitte', 163], // Total: 328
        ['GARCIA Carlos', 160, 'DAVID Francine', 158], // Total: 318
        ['BERTRAND Luc', 155, 'ROUX Monique', 153], // Total: 308
        ['FOURNIER Henri', 150, 'GIRARD Nicole', 148], // Total: 298
        ['BONNET Andre', 145, 'DUPONT Jacqueline', 143], // Total: 288
        ['LAMBERT Denis', 140, 'FONTAINE Sylvie', 138], // Total: 278
        ['ROUSSEAU Gerard', 135, 'VINCENT Martine', 133], // Total: 268
        ['MULLER Hans', 130, 'LEROY Danielle', 128], // Total: 258
        ['FABRE Claude', 125, 'ANDRE Catherine', 123], // Total: 248
        ['MERCIER Roger', 120, 'BLANC Isabelle', 118], // Total: 238
        ['GUERIN Marcel', 115, 'BOYER Yvette', 113], // Total: 228
        ['CLEMENT Francis', 110, 'CHEVALIER Odette', 108], // Total: 218
        ['FRANCOIS Raymond', 105, 'GAUTHIER Helene', 103], // Total: 208
        ['PERRIN Yves', 100, 'MOREL Simone', 98], // Total: 198
        ['ROBIN Fernand', 95, 'COLIN Jeanne', 93], // Total: 188
        ['LECLERC Maurice', 90, 'BARBIER Suzanne', 88], // Total: 178
        ['ARNAUD Robert', 85, 'MARTINEZ Carmen', 83], // Total: 168
        ['GAILLARD Henri', 80, 'BRUN Marguerite', 78], // Total: 158
        ['GARNIER Louis', 75, 'FAURE Marie-Claire', 73], // Total: 148
        ['LEMAIRE Antoine', 70, 'ROUSSEL Georgette', 68], // Total: 138
        ['GIRAUD Pierre', 65, 'HENRY Solange', 63], // Total: 128
        ['REY Jean-Claude', 60, 'PEREZ Dolores', 58], // Total: 118
        ['MOULIN Bernard', 55, 'HUBERT Denise', 53], // Total: 108
        ['LUCAS Serge', 50, 'DUFOUR Madeleine', 48], // Total: 98
        ['BRUNET Charles', 45, 'MARTIN Colette', 43], // Total: 88
        ['SCHMITT Fritz', 40, 'RODRIGUEZ Maria', 38], // Total: 78
        ['COLIN Patrick', 35, 'LEROUX Paulette', 33], // Total: 68
        ['AUBRY Christian', 30, 'PICARD Therese', 28], // Total: 58
        ['GUYOT Rene', 25, 'MEUNIER Lucette', 23], // Total: 48
        ['BARRE Emile', 20, 'CHARLES Raymonde', 18] // Total: 38
    ];

    for (let i = 0; i < 35; i++) {
        const [nom1, iv1, nom2, iv2] = pairesData[i];
        const licenseNum1 = String(i * 2 + 1).padStart(8, '0');
        const licenseNum2 = String(i * 2 + 2).padStart(8, '0');
        const time = String(14 + Math.floor(i / 4)).padStart(2, '0') + ':' + String(15 + (i % 4) * 10).padStart(2, '0');

        testData += `13/01/2026 ${time}\n`;
        testData += `M. ${nom1} ( 5.00 € )\n`;
        testData += `${licenseNum1} ( IV = ${iv1} )\n`;
        testData += `Mme ${nom2} ( 5.00 € )\n`;
        testData += `${licenseNum2} ( IV = ${iv2} )\n`;
        testData += 'Inscription\n';
    }

    return testData;
}

function generateTestData80() {
    // 80 PAIRES FIXES - Ordre décroissant d'IV total (395 → 23)
    let testData = 'Tournoi Bridge Club Nancy - Test 80 paires du 13/01/2026 à 14:15\n';
    testData += '80 équipe(s)\n';
    testData += 'Nouvelle équipe\n';
    testData += 'Inscription    Joueur 1    Joueur 2    Actions\n';

    // Les 80 paires avec IVs décroissants fixes
    const pairesData80 = [
        ['MARTIN Pierre', 200, 'BERNARD Marie', 195], // Total: 395
        ['THOMAS Jean', 194, 'DUBOIS Anne', 189], // Total: 383
        ['ROBERT Paul', 188, 'PETIT Claire', 183], // Total: 371
        ['RICHARD Michel', 182, 'MOREAU Sophie', 177], // Total: 359
        ['SIMON Philippe', 176, 'LAURENT Christine', 171], // Total: 347
        ['LEFEVRE Alain', 170, 'MICHEL Brigitte', 165], // Total: 335
        ['GARCIA Carlos', 164, 'DAVID Francine', 159], // Total: 323
        ['BERTRAND Luc', 158, 'ROUX Monique', 153], // Total: 311
        ['FOURNIER Henri', 152, 'GIRARD Nicole', 147], // Total: 299
        ['BONNET Andre', 146, 'DUPONT Jacqueline', 141], // Total: 287
        ['LAMBERT Denis', 140, 'FONTAINE Sylvie', 135], // Total: 275
        ['ROUSSEAU Gerard', 134, 'VINCENT Martine', 129], // Total: 263
        ['MULLER Hans', 128, 'LEROY Danielle', 123], // Total: 251
        ['FABRE Claude', 122, 'ANDRE Catherine', 117], // Total: 239
        ['MERCIER Roger', 116, 'BLANC Isabelle', 111], // Total: 227
        ['GUERIN Marcel', 110, 'BOYER Yvette', 105], // Total: 215
        ['CLEMENT Francis', 104, 'CHEVALIER Odette', 99], // Total: 203
        ['FRANCOIS Raymond', 98, 'GAUTHIER Helene', 93], // Total: 191
        ['PERRIN Yves', 92, 'MOREL Simone', 87], // Total: 179
        ['ROBIN Fernand', 86, 'COLIN Jeanne', 81], // Total: 167
        ['LECLERC Maurice', 80, 'BARBIER Suzanne', 75], // Total: 155
        ['ARNAUD Robert', 74, 'MARTINEZ Carmen', 69], // Total: 143
        ['GAILLARD Henri', 68, 'BRUN Marguerite', 63], // Total: 131
        ['GARNIER Louis', 62, 'FAURE Marie-Claire', 57], // Total: 119
        ['LEMAIRE Antoine', 56, 'ROUSSEL Georgette', 51], // Total: 107
        ['GIRAUD Pierre', 50, 'HENRY Solange', 45], // Total: 95
        ['REY Jean-Claude', 44, 'PEREZ Dolores', 39], // Total: 83
        ['MOULIN Bernard', 38, 'HUBERT Denise', 33], // Total: 71
        ['LUCAS Serge', 32, 'DUFOUR Madeleine', 27], // Total: 59
        ['BRUNET Charles', 26, 'MARTIN Colette', 21], // Total: 47
        ['SCHMITT Fritz', 20, 'RODRIGUEZ Maria', 15], // Total: 35
        ['COLIN Patrick', 14, 'LEROUX Paulette', 9], // Total: 23
        // Compléter jusqu'à 80 paires...
        ['AUBRY Christian', 180, 'PICARD Therese', 175],
        ['GUYOT Rene', 174, 'MEUNIER Lucette', 169],
        ['BARRE Emile', 168, 'CHARLES Raymonde', 163],
        ['RENAUD Albert', 162, 'PHILIPPE Andree', 157],
        ['DURAND Michel', 156, 'MOREAU Elisabeth', 151],
        ['LEBLANC Jean-Pierre', 150, 'DUBOIS Francoise', 145],
        ['BONNET Laurent', 144, 'ROUX Catherine', 139],
        ['CLAUDE Pierre', 138, 'MARTIN Sophie', 133],
        ['BERNARD Jacques', 132, 'PETIT Nicole', 127],
        ['ROBERT Antoine', 126, 'GIRARD Sylvie', 121],
        ['THOMAS Philippe', 120, 'DUBOIS Monique', 115],
        ['RICHARD Jean', 114, 'MOREAU Brigitte', 109],
        ['SIMON Claude', 108, 'LAURENT Danielle', 103],
        ['LEFEVRE Paul', 102, 'MICHEL Christine', 97],
        ['GARCIA Jean-Luc', 96, 'DAVID Marie-Claire', 91],
        ['BERTRAND Henri', 90, 'ROUX Isabelle', 85],
        ['FOURNIER Louis', 84, 'GIRARD Martine', 79],
        ['BONNET Christian', 78, 'DUPONT Suzanne', 73],
        ['LAMBERT Pierre', 72, 'FONTAINE Marie', 67],
        ['ROUSSEAU Michel', 66, 'VINCENT Anne', 61],
        ['MULLER Paul', 60, 'LEROY Christine', 55],
        ['FABRE Jacques', 54, 'ANDRE Sylvie', 49],
        ['MERCIER Jean', 48, 'BLANC Marie-France', 43],
        ['GUERIN Pierre', 42, 'BOYER Catherine', 37],
        ['CLEMENT Jean-Claude', 36, 'CHEVALIER Marie', 31],
        ['FRANCOIS Paul', 30, 'GAUTHIER Sophie', 25],
        ['PERRIN Michel', 24, 'MOREL Danielle', 19],
        ['ROBIN Jean-Pierre', 18, 'COLIN Marie-Claire', 13],
        ['LECLERC Paul', 12, 'BARBIER Nicole', 7],
        ['ARNAUD Michel', 6, 'MARTINEZ Francoise', 1],
        ['GAILLARD Jean', 170, 'BRUN Catherine', 165],
        ['GARNIER Pierre', 164, 'FAURE Elisabeth', 159],
        ['LEMAIRE Michel', 158, 'ROUSSEL Marie', 153],
        ['GIRAUD Jean-Luc', 152, 'HENRY Brigitte', 147],
        ['REY Pierre', 146, 'PEREZ Marie-Carmen', 141],
        ['MOULIN Jean', 140, 'HUBERT Sophie', 135],
        ['LUCAS Michel', 134, 'DUFOUR Catherine', 129],
        ['BRUNET Jean-Pierre', 128, 'MARTIN Marie-France', 123],
        ['SCHMITT Jean', 122, 'RODRIGUEZ Carmen', 117],
        ['COLIN Michel', 116, 'LEROUX Marie-Claire', 111],
        ['AUBRY Jean-Luc', 110, 'PICARD Nicole', 105],
        ['GUYOT Pierre', 104, 'MEUNIER Sylvie', 99],
        ['BARRE Jean', 98, 'CHARLES Marie', 93],
        ['RENAUD Michel', 92, 'PHILIPPE Catherine', 87],
        ['MARCEL Antoine', 86, 'LEBRUN Sophie', 81],
        ['NICOLAS Pierre', 80, 'MERCIER Marie', 75],
        ['PAULIN Jean', 74, 'ROYER Catherine', 69],
        ['JEAN Michel', 68, 'LAURENT Marie-Francoise', 63],
        ['PIERRE Paul', 62, 'MARIE Anne', 57],
        ['JACQUES Henri', 56, 'CLAUDE Sylvie', 51],
        ['MICHEL Jean', 50, 'NICOLE Marie', 45],
        ['BERNARD Paul', 44, 'CATHERINE Anne', 39],
        ['ROBERT Jean', 38, 'MARIE Claire', 33],
        ['JEAN Paul', 32, 'ANNE Marie', 27],
        ['PAUL Michel', 26, 'CLAIRE Nicole', 21],
        ['HENRI Jean', 20, 'SYLVIE Marie', 15],
        ['CLAUDE Paul', 14, 'MARIE Anne', 9],
        ['JEAN Michel', 8, 'NICOLE Claire', 3]
    ];

    for (let i = 0; i < 80; i++) {
        const [nom1, iv1, nom2, iv2] = pairesData80[i];
        const licenseNum1 = String(i * 2 + 1).padStart(8, '0');
        const licenseNum2 = String(i * 2 + 2).padStart(8, '0');
        const time = String(14 + Math.floor(i / 8)).padStart(2, '0') + ':' + String(15 + (i % 8) * 5).padStart(2, '0');

        testData += `13/01/2026 ${time}\n`;
        testData += `M. ${nom1} ( 5.00 € )\n`;
        testData += `${licenseNum1} ( IV = ${iv1} )\n`;
        testData += `Mme ${nom2} ( 5.00 € )\n`;
        testData += `${licenseNum2} ( IV = ${iv2} )\n`;
        testData += 'Inscription\n';
    }

    return testData;
}