'use strict';

// Module einbinden
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const validator = require("email-validator");
const IBANValidator = require('iban-validator-js');
const sqlite3 = require('sqlite3').verbose();

// SQLite-Datenbank einrichten
const db = new sqlite3.Database('./banking.db', (err) => {
    if (err) {
        console.error('Fehler beim Verbinden mit der SQLite-Datenbank:', err.message);
    } else {
        console.log('Verbindung zur SQLite-Datenbank hergestellt.');
    }
});

// Tabelle für Kunden erstellen
db.run(`
    CREATE TABLE IF NOT EXISTS Kunden (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        Nachname TEXT,
        Vorname TEXT,
        Benutzername TEXT UNIQUE,
        Kennwort TEXT,
        IstEingeloggt BOOLEAN,
        Mail TEXT
    )
`, (err) => {
    if (err) {
        console.error('Fehler beim Erstellen der Tabelle Kunden:', err.message);
    } else {
        console.log('Tabelle Kunden erstellt oder existiert bereits.');
    }
});

// Tabelle für Kunde erstellen
db.run(`
    CREATE TABLE IF NOT EXISTS Kunde (
        KundenNR INTEGER PRIMARY KEY AUTOINCREMENT,
        Nachname TEXT,
        Vorname TEXT,
        Wohnort TEXT,
        Postleitzahl TEXT,
        Strasse TEXT,
        Kennwort TEXT,
        Benutzername TEXT UNIQUE
    )
`, (err) => {
    if (err) {
        console.error('Fehler beim Erstellen der Tabelle Kunde:', err.message);
    } else {
        console.log('Tabelle Kunde erstellt oder existiert bereits.');
    }
});

// Beispiel: Einen neuen Kunden hinzufügen
db.run(`
    INSERT INTO Kunden (Nachname, Vorname, Benutzername, Kennwort)
    VALUES (?, ?, ?, ?,)
`, ['Kiff', 'Pit', 'pk', '123'], function (err) {
    if (err) {
        console.error('Fehler beim Hinzufügen eines Kunden:', err.message);
    } else {
        console.log(`Kunde mit ID ${this.lastID} hinzugefügt.`);
    }
});

// Beispiel: Einen neuen Kunden hinzufügen
db.run(`
    INSERT INTO Kunde (Nachname, Vorname, Wohnort, Postleitzahl, Strasse, Kennwort, Benutzername)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`, ['Muster', 'Max', 'Musterstadt', '12345', 'Musterstraße 1', 'passwort123', 'maxmuster'], function (err) {
    if (err) {
        console.error('Fehler beim Hinzufügen eines Kunden:', err.message);
    } else {
        console.log(`Kunde mit KundenNR ${this.lastID} hinzugefügt.`);
    }
});

// Klassen und Objekte
class Kunde {
    constructor() {
        this.Nachname;
        this.Vorname;
        this.Benutzername;
        this.Kennwort;
        this.IstEingeloggt;
        this.Mail;
    }
}

class Kundenberater {
    constructor() {
        this.Nachname;
        this.Vorname;
        this.Telefonnummer;
        this.Mail;
        this.Bild;
    }
}

class Konto {
    constructor() {
        this.Iban;
        this.Saldo;
        this.Inhaber;
    }
}

// Initialisierung der Objekte
let kunde = new Kunde();
kunde.Nachname = "Kiff";
kunde.Vorname = "Pit";
kunde.Benutzername = "pk";
kunde.Kennwort = "123";
kunde.IstEingeloggt = false;
kunde.Mail = "gb123@gmail.com";

let kundenberater = new Kundenberater();
kundenberater.Nachname = "Pass";
kundenberater.Vorname = "Hildegard";
kundenberater.Telefonnummer = "012345 67890";
kundenberater.Mail = "h.pass@borken-bank.de";
kundenberater.Bild = "pass.jpg";

let konto = new Konto();

// Express-App einrichten
const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Routen
app.get('/', (req, res) => {
    if (kunde.IstEingeloggt) {
        res.render('index.ejs', {});
    } else {
        res.render('login.ejs', { Meldung: "Melden Sie sich zuerst an." });
    }
});

app.get('/agb', (req, res) => {
    if (kunde.IstEingeloggt) {
        res.render('agb.ejs', { Meldung: "" });
    } else {
        res.render('login.ejs', { Meldung: "Melden Sie sich zuerst an." });
    }
});

app.get('/hilfe', (req, res) => {
    if (kunde.IstEingeloggt) {
        res.render('hilfe.ejs', {});
    } else {
        res.render('login.ejs', { Meldung: "Melden Sie sich zuerst an." });
    }
});

app.get('/kontenuebersicht', (req, res) => {
    if (kunde.IstEingeloggt) {
        res.render('kontenuebersicht.ejs', {
            Meldung: "",
            Inhaber: konto.Inhaber,
            Saldo: konto.Saldo,
            Iban: konto.Iban,
        });
    } else {
        res.render('login.ejs', { Meldung: "Melden Sie sich zuerst an." });
    }
});

app.post('/kontenuebersicht', (req, res) => {
    konto.Iban = req.body.IBAN;
    konto.Inhaber = req.body.Inhaber;
    konto.Saldo = 10;

    if (IBANValidator.isValid(konto.Iban)) {
        res.render('kontenuebersicht.ejs', {
            Meldung: "Sie haben erfolgreich ein Konto angelegt.",
            Inhaber: konto.Inhaber,
            Saldo: konto.Saldo,
            Iban: konto.Iban,
        });
    } else {
        res.render('kontenuebersicht.ejs', {
            Meldung: "Bitte erneut mit einer gültigen IBAN versuchen.",
            Inhaber: "",
            Saldo: "",
            Iban: "",
        });
    }
});

app.get('/profil', (req, res) => {
    if (kunde.IstEingeloggt) {
        res.render('profil.ejs', {
            Meldung: "",
            Email: kunde.Mail
        });
    } else {
        res.render('login.ejs', { Meldung: "Melden Sie sich zuerst an." });
    }
});

app.post('/profil', (req, res) => {
    if (kunde.IstEingeloggt) {
        const email = req.body.Email;
        let meldung = "";

        if (validator.validate(email)) {
            meldung = "E-Mail-Adresse gültig. Deine neue E-Mail ist: " + email;
            kunde.Mail = email;
        } else {
            meldung = "E-Mail-Adresse ungültig. Bitte überprüfe deine Eingabe.";
        }

        res.render('profil.ejs', {
            Meldung: meldung,
            Email: email
        });
    } else {
        res.render('login.ejs', { Meldung: "Melden Sie sich zuerst an." });
    }
});

app.get('/login', (req, res) => {
    kunde.IstEingeloggt = false;
    res.render('login.ejs', { Meldung: "Bitte Benutzername und Kennwort eingeben." });
});

app.post('/login', (req, res) => {
    const benutzername = req.body.IdKunde;
    const kennwort = req.body.Kennwort;

    db.get(`
        SELECT * FROM Kunden WHERE Benutzername = ? AND Kennwort = ?
    `, [benutzername, kennwort], (err, row) => {
        if (err) {
            console.error('Fehler beim Abrufen des Kunden:', err.message);
            res.render('login.ejs', { Meldung: 'Ein Fehler ist aufgetreten.' });
        } else if (row) {
            kunde.IstEingeloggt = true;
            res.cookie('istAngemeldetAls', JSON.stringify(row), { maxAge: 900000, httpOnly: true });
            res.render('index.ejs', { Meldung: 'Die Zugangsdaten wurden korrekt eingegeben.' });
        } else {
            res.render('login.ejs', { Meldung: 'Die Zugangsdaten wurden NICHT korrekt eingegeben.' });
        }
    });
});

// Server starten
app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});

// Datenbankverbindung schließen bei Server-Stop
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Fehler beim Schließen der SQLite-Datenbank:', err.message);
        } else {
            console.log('SQLite-Datenbankverbindung geschlossen.');
        }
        process.exit(0);
    });
});