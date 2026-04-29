# 🐛 DEBUG DARK MODE - Istruzioni Dettagliate

## ✅ Verifica Locale

Il codice dark mode è **presente e corretto** nel repository:

```
✅ CSS Variables dark mode (riga 32)
✅ Pulsante toggle header (riga 230) 
✅ JavaScript toggleDarkMode() (riga 699)
✅ SVG icone sole/luna (riga 231-232)
```

## 🔍 Verifica Deploy Vercel

### Passo 1: Controlla GitHub
1. Vai su https://github.com/alessandroparrelli/cnacontratti
2. Verifica che l'ultimo commit sia **fda5eb2** o successivo
3. Titolo commit: "Add test-dark-mode.html per debug"

### Passo 2: Controlla Vercel Dashboard
1. Vai su https://vercel.com/dashboard
2. Cerca il progetto "cnacontratti"
3. Verifica lo stato:
   - ✅ **Ready** = deploy completato
   - 🟡 **Building** = deploy in corso (aspetta 1-2 minuti)
   - ❌ **Error** = c'è un errore (controlla i log)

### Passo 3: Test Pagina Dark Mode
1. Apri https://cnacontratti.vercel.app/test-dark-mode.html
2. Dovresti vedere:
   - Header blu con pulsante bianco
   - Icona sole ☀️
   - Testo "Attiva Dark Mode"
3. Clicca il pulsante → tutto dovrebbe diventare scuro
4. Se funziona = dark mode OK, problema di cache

### Passo 4: Svuota Cache Browser

**Windows/Linux (Chrome/Edge)**:
1. Premi `Ctrl+Shift+R` (hard refresh)
2. Oppure: 
   - F12 (apri DevTools)
   - Click destro su icona refresh
   - Scegli "Svuota cache e ricarica"

**Mac (Chrome/Safari)**:
1. Premi `Cmd+Shift+R` (hard refresh)
2. Safari: Preferenze → Avanzate → Mostra menu sviluppo → Sviluppo → Svuota cache

**Mobile**:
1. Chiudi COMPLETAMENTE il browser (swipe via dalle app)
2. Apri Impostazioni Browser → Privacy → Cancella dati → Immagini nella cache
3. Riapri browser e vai su https://cnacontratti.vercel.app

## 🎯 Dove Trovare il Pulsante Dark Mode

**Posizione**: Header in alto a destra, tra "Versioni" e nome utente

```
[ Logo CNA ] Signature v2.0     [ 📋 Versioni ] [ 🌙 ] [ 👤 Nome ] [ → Esci ]
                                                  ↑
                                          Pulsante Dark Mode
```

**Come appare**:
- Light mode: Icona SOLE ☀️ bianca
- Dark mode: Icona LUNA 🌙 bianca

## ⚠️ Se NON Vedi il Pulsante

Possibili cause:

1. **Cache del browser** (più probabile)
   - Soluzione: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
   
2. **Deploy non completato su Vercel**
   - Controlla Vercel Dashboard
   - Aspetta che lo stato diventi "Ready"
   
3. **JavaScript disabilitato**
   - Controlla impostazioni browser
   - Il pulsante viene creato via HTML, ma le icone SVG potrebbero non caricarsi

4. **Schermo troppo piccolo**
   - Su mobile il pulsante c'è ma potrebbe essere fuori schermo
   - Scrolla l'header orizzontalmente

## 🧪 Test Manuale JavaScript

Apri la **Console** (F12) e digita:

```javascript
// Test 1: Verifica funzione esiste
typeof toggleDarkMode
// Output atteso: "function"

// Test 2: Attiva dark mode
document.body.classList.add('dark-mode')
// Lo sfondo dovrebbe diventare scuro

// Test 3: Disattiva dark mode  
document.body.classList.remove('dark-mode')
// Lo sfondo dovrebbe tornare chiaro
```

## 📞 Supporto

Se dopo tutti questi passaggi il pulsante NON appare:

1. Invia screenshot di:
   - L'header completo (in alto)
   - La Console (F12 → Console tab)
   - Vercel Dashboard deployment status

2. Specifica:
   - Browser usato (Chrome, Firefox, Safari, Edge)
   - Sistema operativo (Windows, Mac, Linux, iOS, Android)
   - Se stai usando VPN o proxy aziendali

## ✅ Verifica Finale

Quando funziona dovresti vedere:

**Light Mode (default)**:
- Sfondo chiaro grigio #f5f6f8
- Card bianche #fff
- Testo scuro #1a2332
- Icona ☀️ sole nell'header

**Dark Mode (dopo click)**:
- Sfondo scuro #0f1419
- Card grigio scuro #1a1f2e  
- Testo chiaro #e4e6eb
- Icona 🌙 luna nell'header

---

**Versione**: v7.4.3  
**Build**: 1777466476  
**Ultimo commit**: fda5eb2
