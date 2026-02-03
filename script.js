// Chargement des données au démarrage
let stocks = JSON.parse(localStorage.getItem('agri_stocks')) || [];
let lots = JSON.parse(localStorage.getItem('agri_lots')) || [];

// --- GESTION DES STOCKS ---
function ajouterStock() {
    const nom = document.getElementById('stkNom').value;
    const qte = parseFloat(document.getElementById('stkQuantite').value);
    const prix = parseFloat(document.getElementById('stkPrix').value);

    if(!nom || isNaN(qte) || isNaN(prix)) return alert("Veuillez remplir tous les champs du stock.");

    const prixUnitaire = prix / qte;
    let existant = stocks.find(s => s.nom.toLowerCase() === nom.toLowerCase());

    if(existant) {
        // Calcul du nouveau prix moyen pondéré
        const ancienCoutTotal = existant.quantite * existant.prixUnitaire;
        const nouveauCoutTotal = ancienCoutTotal + prix;
        existant.quantite += qte;
        existant.prixUnitaire = nouveauCoutTotal / existant.quantite;
    } else {
        stocks.push({ nom, quantite: qte, prixUnitaire: prixUnitaire });
    }
    
    viderChamps(['stkNom', 'stkQuantite', 'stkPrix']);
    sauvegarderEtAfficher();
}

// --- GESTION DES LOTS ---
function creerLot() {
    const nom = document.getElementById('lotNom').value;
    const effectif = parseInt(document.getElementById('lotEffectif').value);
    const alimentNom = document.getElementById('lotAlimentSelect').value;
    const consoIndiv = parseFloat(document.getElementById('lotConso').value);

    if(!nom || isNaN(effectif) || !alimentNom || isNaN(consoIndiv)) {
        return alert("Veuillez compléter la création du lot.");
    }

    lots.push({
        nom,
        effectif,
        alimentNom,
        consoIndiv,
        joursPasses: 0,
        consoCumulee: 0,
        coutCumule: 0
    });

    viderChamps(['lotNom', 'lotEffectif', 'lotConso']);
    sauvegarderEtAfficher();
}

function simulerJour(index) {
    let lot = lots[index];
    let stockAliment = stocks.find(s => s.nom === lot.alimentNom);
    let consoQuotidienne = lot.effectif * lot.consoIndiv;

    if (stockAliment && stockAliment.quantite >= consoQuotidienne) {
        stockAliment.quantite -= consoQuotidienne;
        lot.joursPasses += 1;
        lot.consoCumulee += consoQuotidienne;
        lot.coutCumule += (consoQuotidienne * stockAliment.prixUnitaire);
        sauvegarderEtAfficher();
    } else {
        alert(`Stock insuffisant de ${lot.alimentNom} !`);
    }
}

// --- UTILITAIRES ---
function sauvegarderEtAfficher() {
    localStorage.setItem('agri_stocks', JSON.stringify(stocks));
    localStorage.setItem('agri_lots', JSON.stringify(lots));
    
    // Affichage Stocks
    document.getElementById('listeStocks').innerHTML = stocks.map(s => `
        <div class="stats-item">
            <strong>${s.nom}</strong>: ${s.quantite.toFixed(2)} kg<br>
            <small>Prix moyen: ${s.prixUnitaire.toFixed(2)}€/kg</small>
        </div>
    `).join('');

    // Mise à jour du sélecteur d'aliments
    document.getElementById('lotAlimentSelect').innerHTML = 
        '<option value="">-- Choisir un aliment --</option>' + 
        stocks.map(s => `<option value="${s.nom}">${s.nom}</option>`).join('');

    // Affichage Lots
    document.getElementById('listeLots').innerHTML = lots.map((l, i) => `
        <div class="stats-item" style="border-left-color: var(--accent);">
            <strong>${l.nom}</strong> (${l.effectif} têtes)<br>
            <button onclick="simulerJour(${i})">Simuler +1 Jour</button>
        </div>
    `).join('');

    // Synthèse financière
    document.getElementById('tableauSynthese').innerHTML = lots.map(l => {
        const coutTete = l.coutCumule / l.effectif;
        return `<tr>
            <td>${l.nom}</td>
            <td>${l.joursPasses} j</td>
            <td>${l.consoCumulee.toFixed(1)} kg</td>
            <td>${l.coutCumule.toFixed(2)} €</td>
            <td><strong>${coutTete.toFixed(2)} €</strong></td>
        </tr>`;
    }).join('');
}

function viderChamps(ids) {
    ids.forEach(id => document.getElementById(id).value = '');
}

function reinitialiserTout() {
    if(confirm("Effacer toutes les données ?")) {
        localStorage.clear();
        stocks = [];
        lots = [];
        sauvegarderEtAfficher();
    }
}

// Init au chargement
sauvegarderEtAfficher();
