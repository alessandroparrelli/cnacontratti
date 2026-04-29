# Signature CNA v2.0 - Documentazione Completa

**Dashboard Tesseramento CNA Roma**  
Sistema di gestione contratti, firme digitali e tesseramento

---

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Tecnologie Utilizzate](#tecnologie-utilizzate)
3. [Funzionalità Principali](#funzionalità-principali)
4. [Struttura Progetto](#struttura-progetto)
5. [Database Supabase](#database-supabase)
6. [Deploy e Hosting](#deploy-e-hosting)
7. [Guida Utilizzo](#guida-utilizzo)
8. [Changelog](#changelog)

---

## 🎯 Panoramica

**Signature CNA v2.0** è un'applicazione web completa per la gestione dei contratti di tesseramento CNA Roma. Permette di:

- Compilare moduli di adesione online
- Raccogliere firme digitali dai clienti
- Generare PDF firmati automaticamente
- Gestire una dashboard con tutti i contratti
- Filtrare e cercare contratti per stato, anno, proprietario
- Esportare dati in Excel
- Inviare contratti via email ai clienti

**URL Produzione**: https://cnacontratti.vercel.app  
**Repository GitHub**: https://github.com/alessandroparrelli/cnacontratti

---

## 🛠 Tecnologie Utilizzate

### Frontend
- **HTML5** + **CSS3** (no framework, vanilla)
- **JavaScript ES6+** (no build step)
- **PDF-lib** (generazione PDF dinamici)
- **Canvas API** (firma digitale)

### Backend & Database
- **Supabase** (PostgreSQL + Auth + Storage)
  - Database: `CNA_Tesseramento`
  - Project ID: `ohahuqlfzqckaevaffbt`
  - Tabelle: `cna_contratti`, `cna_users`, `codiciateco`

### Hosting & Deploy
- **Vercel** (hosting statico + auto-deploy da GitHub)
- **GitHub** (version control)
  - Repo: `alessandroparrelli/cnacontratti`
  - Branch: `main`
  - Auto-deploy: ✅ attivo

---

## ✨ Funzionalità Principali

### 1. Modulo Adesione Unificato
- Form unico con sezioni: Dati Personali, Dati Aziendali, Iscrizione, Privacy, INPS, SEPA
- **27 campi obbligatori** con validazione visiva (asterisco rosso, bordo verde quando compilati)
- Dropdown ATECO con 49 mestieri
- Campi quota in valuta (€ 100,00)
- Auto-compilazione campi mirror (CF, nome, cognome)

### 2. Firma Digitale
- Canvas HTML5 per firma touchscreen/mouse
- **5 box firma** nel PDF finale (Consenso, Dichiarazione, Privacy, INPS, SEPA)
- Aspect ratio preservato per evitare deformazioni
- Firma invisibile nell'interfaccia operatore, visibile solo nel PDF

### 3. Generazione PDF
- PDF dinamico con dati compilati
- Firma embedded in 5 posizioni
- Base template: modulo CNA 2025
- Download automatico PDF firmato

### 4. Dashboard Contratti
- **Filtri avanzati**: Cerca cliente, Tipo, Stato (Firmati/Da firmare/Bozze), Anno, Proprietario, Gestionale
- **Stats box** con gradiente colorato (Contratti creati, In attesa, Da caricare, Caricati)
- Layout responsive: desktop 2 colonne, mobile verticale
- Selezione multipla + Esporta Excel
- Elimina contratti (solo admin)

### 5. Sistema Autenticazione
- Login email/password tramite Supabase Auth
- Sessione persistente
- Ruoli: `operatore`, `admin`
- Logout sicuro

---

## 📁 Struttura Progetto

```
cnacontratti/
├── index.html              # File principale (single-page app)
├── favicon.ico             # Logo CNA (icona app)
├── vercel.json            # Config Vercel deploy
├── README.md              # README GitHub
├── DOCUMENTAZIONE.md      # Questo file
└── .git/                  # Git repository
```

### File Unico: `index.html`

L'app è contenuta in un singolo file HTML (~1700 righe) con:

- **CSS inline** (riga 9-157): stili completi, responsive, tema colori CNA
- **HTML structure** (riga 158-346): login, header, tabs, form, dashboard
- **JavaScript inline** (riga 347-1732): logica completa dell'app

**Sezioni JavaScript principali**:
- Configurazione Supabase (riga 347-360)
- Autenticazione (riga 362-420)
- Firma digitale (riga 422-480)
- Mirroring campi (riga 482-540)
- Generazione PDF (riga 850-1100)
- Dashboard e filtri (riga 1200-1400)
- Export Excel (riga 1450-1550)

---

## 🗄 Database Supabase

### Tabella: `cna_contratti`

Campi principali (45 colonne totali):

**Dati Anagrafici**
- `cognome`, `nome`, `cf`, `data_nascita`
- `nato_a`, `prov_nascita`, `stato_nascita`
- `residente_in`, `comune_res`, `cap_res`, `prov_res`, `stato_res`
- `telefono`, `cellulare`, `email`

**Dati Aziendali**
- `ragione_sociale`, `piva`, `ateco`, `pec`
- `sede_attivita`, `comune_att`, `cap_att`, `prov_att`
- `cod_inail`, `cod_inail_pat`, `documento_id`
- `tipo_a`, `tipo_c`, `tipo_p`, `tipo_v` (boolean tipologie)

**Quote e Pagamento**
- `quota_1_anno`, `quota_inps`, `quota_diretto` (numeric)
- `data_adesione`, `motivo_iscrizione`
- `modalita_pagamento_sel`, `iban_ditta`
- `mod_rid`, `mod_riba`, `mod_rd`, `mod_sepa`, `mod_altro` (boolean)

**SEPA e INPS**
- `id_mandato`, `banca_agenzia`, `data_sepa`, `luogo_sepa`
- `sepa_b2b`, `sepa_core` (boolean)
- `cod_inps`, `data_inps`

**Privacy e Firme**
- `data_consenso`, `data_dichiarazione`

**Gestione**
- `stato` (text: 'bozza', 'inviato', 'firmato')
- `token` (uuid unico per link firma)
- `tipo_contratto` (text: 'adesione_2025', 'tesseramento')
- `anno` (integer: 2024, 2025, 2026)
- `pdf_firmato_base64` (text: PDF embedded)
- `documento_foto_base64` (text: foto documento)
- `created_at`, `updated_at` (timestamp)
- `created_by` (uuid: riferimento a `cna_users`)
- `raccolto_da` (text: nome operatore)
- `caricato_gestionale` (boolean)

### Tabella: `cna_users`

- `id` (uuid, primary key)
- `email` (text, unique)
- `nome`, `cognome` (text)
- `ruolo` (text: 'operatore', 'admin')
- `created_at` (timestamp)

### Tabella: `codiciateco`

- `id` (serial, primary key)
- `codice` (text)
- `descrizione` (text)
- 3119 record totali (49 mestieri DISTINCT usati nell'app)

---

## 🚀 Deploy e Hosting

### Vercel (Auto-Deploy)

**URL Produzione**: https://cnacontratti.vercel.app

**Processo Deploy**:
1. Push commit su GitHub branch `main`
2. Vercel rileva il push automaticamente
3. Build e deploy in 30-60 secondi
4. App live con nuova versione

**Config** (`vercel.json`):
```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### GitHub Repository

**Repo**: https://github.com/alessandroparrelli/cnacontratti  
**Branch**: `main` (auto-deploy attivo)  
**Username**: `alessandroparrelli`

**Comandi Git**:
```bash
git add .
git commit -m "messaggio commit"
git push origin main
```

---

## 📱 Guida Utilizzo

### 1. Login

- Accedere a https://cnacontratti.vercel.app
- Inserire email e password operatore CNA
- Click su "Accedi"

### 2. Compilare Nuovo Contratto

1. Click su tab "Modulo Adesione"
2. Compilare tutti i campi obbligatori (asterisco rosso)
3. I campi diventano verdi quando compilati correttamente
4. Campo "Raccolto da" auto-compilato con nome operatore loggato
5. Firme nascoste (generate automaticamente nel PDF)

**Campi Obbligatori (27)**:
- Cognome, Nome, CF, Data nascita, Nato a, Prov. nascita
- Residente in, Comune, CAP, Prov. residenza, Telefono, Cellulare, Email
- Ragione sociale, P.IVA, ATECO, PEC
- Sede attività, Comune, CAP, Prov. attività
- Motivo iscrizione, Quota 1° anno, Data adesione, Quota INPS, Quota dal 2° anno
- IBAN Ditta, Data consenso, Data INPS, Data SEPA

### 3. Salvare Bozza

- Click su "Salva Bozza" nel footer
- Contratto salvato come bozza nel database
- Visibile nella dashboard con stato "Bozza"

### 4. Inviare Contratto Cliente

- Compilare email cliente
- Click su "Salva e Invia"
- Email inviata con link firma al cliente
- Stato diventa "Inviato"

### 5. Firma Cliente

- Cliente riceve email con link
- Apre link firma (formato: `?firma=TOKEN`)
- Firma nel box digitale
- Click "Conferma Firma"
- PDF generato automaticamente
- Stato diventa "Firmato"

### 6. Dashboard Contratti

**Filtri disponibili**:
- 🔍 Cerca cliente (nome, ragione sociale, email)
- Tipo (Tutti i tipi, Tesseramento)
- Stato (Tutti, Firmati, Da firmare, Bozze)
- Anno (2026, 2025, 2024)
- Proprietario (operatore che ha creato il contratto)
- Gestionale (Tutti, Caricati, Da caricare)

**Azioni su contratti**:
- ✏️ **Modifica**: solo bozze e inviati
- **Invia** / **Invia di nuovo**: per bozze e inviati
- **PDF**: download PDF firmato (solo contratti firmati)
- **Doc**: visualizza foto documento allegato
- **Link**: copia link firma cliente

**Selezione multipla**:
- Click checkbox per selezionare contratti
- Pulsante "📊 Esporta Excel" per export dati
- Pulsante "🗑️ Elimina" (solo admin)

### 7. Esporta Excel

1. Selezionare contratti con checkbox
2. Click "📊 Esporta Excel"
3. File `.xlsx` scaricato con tutti i dati

### 8. Gestionale

Per contratti firmati:
- Dropdown "Da caricare" / "Caricato"
- Cambia stato caricamento gestionale
- Badge colorato indica stato

---

## 📝 Changelog

### v7.3.6 - 29 Aprile 2026
- ✅ Nuovo favicon CNA (logo ufficiale)
- ✅ Meta tag PWA per installazione webapp
- ✅ Apple touch icon per iOS
- ✅ Documentazione completa aggiunta

### v7.3.5 - 29 Aprile 2026
- ✅ Tabella dashboard più larga (1400px)
- ✅ Filtri su 2 righe per evitare espansione
- ✅ Dimensioni tabella fisse

### v7.3.4 - 29 Aprile 2026
- ✅ Fix filtro proprietario (data-proprietario attribute)

### v7.3.3 - 29 Aprile 2026
- ✅ ID Mandato non più obbligatorio

### v7.3.2 - 29 Aprile 2026
- ✅ Titolo dashboard "Signature v2.0"

### v7.3.1 - 29 Aprile 2026
- ✅ Logo login ridotto (100px)

### v7.3 - 29 Aprile 2026
- ✅ Nuova schermata login
- ✅ Rebranding "Signature CNA v2.0"
- ✅ Logo CNA colore centrato

### v7.2 - 29 Aprile 2026
- ✅ Layout desktop 2 colonne
- ✅ Layout mobile verticale
- ✅ Filtro stato (Firmati/Da firmare/Bozze)

### v7.1 - 29 Aprile 2026
- ✅ Firme nascoste (Privacy, INPS, SEPA)
- ✅ Stats con gradiente colorato
- ✅ Layout contratti responsive

### v7.0 - 29 Aprile 2026
- ✅ Header blu Dashboard Tesseramento
- ✅ Tab unificati (Modulo Adesione unico)
- ✅ Campi quota in valuta (€)

### v6.1 - 29 Aprile 2026
- ✅ Asterischi rossi campi obbligatori
- ✅ Bordo verde validazione
- ✅ Rimosso "Raccolta da" duplicato
- ✅ Fix firma PDF su 5 box

### v6.0 - 29 Aprile 2026
- ✅ Campi opzionali (INAIL, INPS, Doc. identità)
- ✅ ATECO dropdown 49 mestieri
- ✅ Fix aspect ratio firma PDF

---

## 🔧 Manutenzione

### Aggiornare il codice

```bash
# 1. Modificare index.html
# 2. Testare in locale
# 3. Commit e push
git add index.html
git commit -m "Descrizione modifica"
git push origin main
# 4. Vercel auto-deploy in 30-60 sec
```

### Aggiungere nuovi utenti

```sql
-- Inserire in Supabase SQL Editor
INSERT INTO cna_users (email, nome, cognome, ruolo)
VALUES ('email@cnaroma.it', 'Mario', 'Rossi', 'operatore');
```

### Backup Database

Via Supabase Dashboard:
1. Settings → Database → Backups
2. Download backup manuale

---

## 📞 Supporto

**Sviluppato per**: CNA Roma  
**Versione**: 2.0  
**Data**: Aprile 2026  

**Tecnologie**:
- Frontend: HTML5, CSS3, JavaScript ES6
- Database: Supabase PostgreSQL
- Hosting: Vercel
- Repository: GitHub

---

**© 2026 CNA Roma - Confederazione Nazionale dell'Artigianato**
