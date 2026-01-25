// Parser pour données FFB Vacances Bleues
// Extrait les 48 paires avec IV, PP, PE corrects

const fs = require('fs');

// Lecture du fichier FFB
const ffbData = `
949888;00386434;M.;MASINI;Gerald;89;241844;766;ON;01531111;Mme;BECKER;Brigitte;89;307433;806;ON;178;549277;1572;4200007;Bridge Club Nancy - Jarville
949372;02138247;Mme;LAMBERT;Anne;83;221384;549;ON;00492900;M.;LAMBERT;Bernard;83;220287;540;ON;166;441671;1089;4200007;Bridge Club Nancy - Jarville
954936;02195776;M.;CHIARA;Jean-Yves;59;144523;75;ON;02195784;Mme;CHIARA;Mireille;59;144529;75;ON;118;289052;150;4200015;Cercle de Bridge de Commercy
948055;04999001;M.;GUILLENTZ;Bertrand;65;163747;89;ON;09973034;Mme;MANNS;Yolande;59;153826;78;ON;124;317573;167;4200029;Bridge Club Freyming-Merlebach
949349;02460856;Mme;WINCZEWSKI;Béatrice;77;153811;215;ON;09890171;M.;WEBER;Christian;77;159905;288;ON;154;313716;503;4200007;Bridge Club Nancy - Jarville
927508;00322785;M.;THIESER;Michel;77;181402;249;ON;01677494;Mme;REUTER;Marie-Lise;77;173380;280;ON;154;354782;529;4200006;Bridge club Rollon Gadelle
947934;02246008;M.;ROTH;Henri;65;115138;92;ON;01378464;Mme;SEYVE;Dominique;71;151553;156;ON;136;266691;248;4200006;Bridge club Rollon Gadelle
911599;00493776;Mme;GAUCHER;Martine;71;114986;150;ON;00381898;M.;KLAJNERMAN;Henri;71;46322;46;ON;142;161308;196;4200007;Bridge Club Nancy - Jarville
948082;02138932;M.;AUBRIOT;Francis;77;186007;220;ON;04208262;Mme;JACQUOT;Catherine;77;156034;194;ON;154;342041;414;4200007;Bridge Club Nancy - Jarville
950198;01981407;M.;HEIM;Thierry;71;125282;188;ON;02164143;Mme;HEIM;Brigitte;77;160963;261;ON;148;286245;449;4200024;Cercle de Bridge de Metz C.S.A.G.
953655;00382995;Mme;DELACOUR;Michèle;71;133866;154;ON;01062158;M.;PAGE;Wayne;71;148691;182;ON;142;282557;336;4200004;Bridge du Pays Haut
947897;02715524;M.;LABRUSSE;Arnaud;71;178180;146;ON;02708967;Mme;MANSUY;Laurence;71;142410;149;ON;142;320590;295;4200025;Association Bridge Nancy Ville
946068;02138510;M.;STEPHANY;Bernard;77;137291;219;ON;01399121;Mme;COLLARD;Isabelle;71;138898;189;ON;148;276189;408;4200007;Bridge Club Nancy - Jarville
949805;01981556;M.;OTT;Jean Marie;77;104496;211;ON;01988693;Mme;ROSENFELD;Danielle;71;131153;139;ON;148;235649;350;4200006;Bridge club Rollon Gadelle
927281;03956721;Mme;LEVEILLE;Brigitte;71;110409;127;ON;01212274;M.;JEANDEMANGE;Michel;71;148391;144;ON;142;258800;271;4200026;Etoile Bridge Club
939493;03460350;Mme;MOSCHKOWITZ;Monique;71;124600;137;ON;03806174;M.;LITAIZE;Jacques;71;141879;152;ON;142;266479;289;4200007;Bridge Club Nancy - Jarville
946621;00381062;Mme;VINCENOT;Monique;77;156871;213;ON;00381054;M.;VINCENOT;Daniel;77;158576;213;ON;154;315447;426;4200007;Bridge Club Nancy - Jarville
923623;00388654;Mme;NOEL;Francine;77;172727;280;ON;01678707;M.;REGNAUD;Philippe;77;164224;216;ON;154;336951;496;4200007;Bridge Club Nancy - Jarville
949780;09721368;M.;TITEUX;Yves;71;206534;189;ON;02759001;Mme;MUNIER;Marie Hélène;59;147489;70;ON;130;354023;259;4200025;Association Bridge Nancy Ville
951285;04208923;M.;HENRION;Luc;71;122921;126;ON;00383042;Mme;FLORENTIN;Marie-Lise;65;119278;105;ON;136;242199;231;4200033;Bridge Club du Val de Meuse
953170;00030239;Mme;CORBARIEU;Danièle;83;221691;458;ON;03142487;M.;JAKIMOW;Michel;77;167220;227;ON;160;388911;685;4200024;Cercle de Bridge de Metz C.S.A.G.
944957;03809350;Mme;SEURIN;Marie Christine;83;222430;493;ON;03809368;M.;SEURIN;Patrick;83;222542;493;ON;166;444972;986;4200011;Bridge Club Thionville
949806;00257742;M.;KLAJNERMAN;Hervé;59;96953;31;ON;04506088;Mme;CHAMBRION;Catherine;59;134831;66;ON;118;231784;97;4200007;Bridge Club Nancy - Jarville
934087;00384826;M.;THIEBAULT;Pierre Andre;59;40012;69;ON;00383878;Mme;THIEBAULT;Chantal;49;47124;69;ON;108;87136;138;4200002;Club de Bridge de Briey-Jarny
947007;00375180;M.;BELUT;Daniel;89;317390;707;ON;00758633;Mme;VILLEVIEILLE;Marie-France;83;242970;450;ON;172;560360;1157;4200007;Bridge Club Nancy - Jarville
952863;01125683;Mme;HELD;Marie-Françoise;71;137422;180;ON;00386202;M.;COCCO;Antonio;95;318261;993;ON;166;455683;1173;4200007;Bridge Club Nancy - Jarville
951554;02650811;M.;CANTAMAGLIA;Néréo;59;98805;28;ON;00957194;Mme;MAEDER;Marie Gabrielle;65;52348;46;ON;124;151153;74;4200025;Association Bridge Nancy Ville
955376;03144178;Mme;DE MONCLIN;Bénédicte;65;125254;121;ON;01231315;M.;CLARIS;Yves;53;92395;61;ON;118;217649;182;4200000;Comité de Lorraine
919256;04560183;Mme;MILION;Chantal;65;68644;38;ON;01955428;M.;JUNG;Daniel;89;229575;680;ON;154;298219;718;4200024;Cercle de Bridge de Metz C.S.A.G.
936408;03043817;Mme;GOUBEAUX;Joele;65;85941;99;ON;01229071;M.;HOUDOT;Gérard;89;207342;615;ON;154;293283;714;4200031;Bridge Club des Ducs
943841;01518333;Mme;MARCHAL;Colette;71;175858;175;ON;01507716;M.;PIERRAT;Anicet;65;124044;95;ON;136;299902;270;4200026;Etoile Bridge Club
946694;01479957;Mme;SIEBENALER;Lorette;71;136465;152;ON;01479949;M.;SIEBENALER;Claude;65;118197;118;ON;136;254662;270;4200011;Bridge Club Thionville
950382;02372879;Mme;TINE;Solange;77;254600;208;ON;04993029;M.;PERRIN;Dominique;77;245092;191;ON;154;499692;399;4200025;Association Bridge Nancy Ville
934773;00385816;Mme;NICOLETTA;Marie-Jose;77;166493;208;ON;01210848;M.;LOUETTE;Anthony;77;187717;196;ON;154;354210;404;4200011;Bridge Club Thionville
947157;09683021;M.;DE CARLI;Michel;71;149016;169;ON;02707703;Mme;SIMON;Véronique;71;157766;155;ON;142;306782;324;4200007;Bridge Club Nancy - Jarville
951195;01594680;Mme;MELINE;Noëlle;71;143686;132;ON;04208949;M.;NANTY;Pascal;71;170681;188;ON;142;314367;320;4200033;Bridge Club du Val de Meuse
940082;01509241;M.;MANGEOT;Jacques;77;177128;209;ON;01367269;Mme;GALMICHE;Denise;71;137198;143;ON;148;314326;352;4200026;Etoile Bridge Club
951626;02679259;Mme;PARENTELLI;Adeline;71;151559;149;ON;02339803;M.;THIEBAUT;Denis;77;128563;243;ON;148;280122;392;4200024;Cercle de Bridge de Metz C.S.A.G.
939496;04998376;Mme;HAYDONT;Anne;71;153250;153;ON;02460137;M.;CUNAT;Alain;71;87799;120;ON;142;241049;273;4200026;Etoile Bridge Club
947843;01996969;Mme;BELLOTTO;Senaït;71;116193;128;ON;01575698;M.;BELLOTTO;Serge;71;141260;156;ON;142;257453;284;4200007;Bridge Club Nancy - Jarville
950367;00325565;Mme;LOSSON;Anne;77;249579;240;ON;00031873;M.;LOSSON;Stefan;77;239265;250;ON;154;488844;490;4200006;Bridge club Rollon Gadelle
951821;00380709;M.;LAVIGNE;Jacky;77;162241;258;ON;00210427;Mme;BOURGUIGNON;Doris;77;144269;215;ON;154;306510;473;4200003;Bridge Club Spinalien
947234;09135204;Mme;QUERNIARD;Thérèse;77;156221;263;ON;01222827;M.;MARIE;Stephan;53;75419;68;ON;130;231640;331;4200004;Bridge du Pays Haut
950698;02539148;M.;BOUDIER;François;71;141824;147;ON;01065540;Mme;VERMEILLE;Beatrix;53;76746;66;ON;124;218570;213;4200003;Bridge Club Spinalien
942749;02137364;M.;JAYTENER;Martial;83;195569;370;ON;01674135;Mme;GIRY;Agnès;83;193875;378;ON;166;389444;748;4200011;Bridge Club Thionville
950883;00628886;Mme;STREICHER;Marie Reine;89;334789;690;ON;03806645;M.;DEMARIA;Robert;77;195323;255;ON;166;530112;945;4200003;Bridge Club Spinalien
942863;01369645;M.;FERREC;François;65;132981;106;ON;04508969;Mme;PFLETSCHINGER-RAFAELL;Louisette;49;53880;35;ON;114;186861;141;4200006;Bridge club Rollon Gadelle
941818;04506757;Mme;MILLON;Christine;59;115611;46;ON;02104404;M.;LEFEVRE;Dominique;59;120077;42;ON;118;235688;88;4200007;Bridge Club Nancy - Jarville`;

// Parser les données
function parsePairs() {
    const lines = ffbData.trim().split('\n').filter(line => line.length > 0);
    const pairs = [];

    lines.forEach(line => {
        const parts = line.split(';');
        if (parts.length >= 21) {
            // Format: id;player1_id;title1;nom1;prenom1;dept1;licence1;pe1;ON;player2_id;title2;nom2;prenom2;dept2;licence2;pe2;ON;iv;pe_pair;pp;club_id;club_name
            const pair = {
                id: parts[0],
                player1: {
                    title: parts[2],
                    lastname: parts[3],
                    firstname: parts[4],
                    pe: parseInt(parts[7])
                },
                player2: {
                    title: parts[10],
                    lastname: parts[11],
                    firstname: parts[12],
                    pe: parseInt(parts[15])
                },
                iv: parseInt(parts[17]),      // Corrigé
                pe_pair: parseInt(parts[18]), // Corrigé
                pp: parseInt(parts[19]),      // Corrigé
                club_id: parts[20],
                club: parts[21]
            };
            pairs.push(pair);
        }
    });

    return pairs;
}

// Tri FFB (IV > PP > PE)
function sortFFB(pairs) {
    return pairs.sort((a, b) => {
        if (a.iv !== b.iv) return b.iv - a.iv;
        if (a.pp !== b.pp) return b.pp - a.pp;
        return b.pe_pair - a.pe_pair;
    });
}

const pairs = parsePairs();
const sortedPairs = sortFFB(pairs);

console.log(`Total paires: ${pairs.length}`);
console.log('\nClassement FFB (IV > PP > PE):');
sortedPairs.slice(0, 10).forEach((pair, i) => {
    const name = `${pair.player1.lastname}/${pair.player2.lastname}`;
    console.log(`${i+1}. ${name} - IV:${pair.iv} PP:${pair.pp} PE:${pair.pe_pair}`);
});

// Export pour analyse MILP
const output = {
    total_pairs: pairs.length,
    configuration: "2x12 tables, 3 rounds, 11 tours",
    sorted_pairs: sortedPairs.map((pair, i) => ({
        rank: i + 1,
        name: `${pair.player1.lastname}/${pair.player2.lastname}`,
        iv: pair.iv,
        pp: pair.pp,
        pe: pair.pe_pair,
        club: pair.club.split(' ').slice(-3).join(' ')
    }))
};

fs.writeFileSync('vacances-bleues-parsed.json', JSON.stringify(output, null, 2));