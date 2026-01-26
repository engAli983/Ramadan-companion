/**
 * Zakat Calculator Logic
 */

function calculateZakat() {
    // Inputs
    const cash = parseFloat(document.getElementById('cash').value) || 0;
    const gold = parseFloat(document.getElementById('gold').value) || 0;
    const silver = parseFloat(document.getElementById('silver').value) || 0;
    const trade = parseFloat(document.getElementById('trade').value) || 0;

    // Prices (Approximation or user input? For MVP we assume a standard or ask user. 
    // Usually calculator asks for Gold price per gram. Let's add input for that or assume fixed for demo?
    // Better to ask user for accurate result or assume standard prices.
    // Let's assume standard prices for now but ideally add input fields for them.
    // Gold ~ 3000 EGP/g (example), Silver ~ 40 EGP/g.
    // To make it generic, we'll ask user for total VALUE of gold/silver or price per gram.)
    
    // Simplification for MVP: User inputs VALUE in currency directly for Gold/Silver OR inputs grams + price.
    // Let's stick to VALUE for simplicity or Grams * Price input.
    // User request: "Inputs: Cash, Gold (grams), Silver (grams), Trade assets".
    // So we need Price per Gram inputs.
    
    const goldPrice = parseFloat(document.getElementById('gold-price').value) || 0;
    const silverPrice = parseFloat(document.getElementById('silver-price').value) || 0;

    const goldValue = gold * goldPrice;
    const silverValue = silver * silverPrice;
    
    const totalAssets = cash + goldValue + silverValue + trade;
    
    // Nisab: 85g Gold (approx).
    const nisabValue = 85 * goldPrice; // Rough estimation logic
    
    // Logic: If total >= Nisab, pay 2.5%
    const resultContainer = document.getElementById('zakat-result');
    const amountDisplay = document.getElementById('zakat-amount');
    const nisabDisplay = document.getElementById('nisab-status');

    if (totalAssets === 0) {
        resultContainer.classList.add('hidden');
        return;
    }

    resultContainer.classList.remove('hidden');

    // Display
    const zakatAmount = totalAssets * 0.025;
    amountDisplay.textContent = Math.ceil(zakatAmount).toLocaleString() + ' عملة';
    
    // Nisab check logic (Using Gold Nisab as standard for currency usually)
    if (goldPrice > 0 && totalAssets >= nisabValue) {
        nisabDisplay.innerHTML = `<span class="text-success">⚠️ بلغ النصاب (قيمة 85 جرام ذهب: ${nisabValue.toLocaleString()}) - تجب الزكاة.</span>`;
    } else if (goldPrice > 0) {
        nisabDisplay.innerHTML = `<span class="text-muted">لم يبلغ النصاب (تقريباً ${nisabValue.toLocaleString()}) - لا تجب الزكاة.</span>`;
    } else {
        nisabDisplay.textContent = "الرجاء إدخال سعر الذهب لحساب النصاب بدقة.";
    }
}

function toggleZakatInfo(id) {
    const el = document.getElementById(id);
    if(el) {
        // Close others logic if needed (optional)
        el.classList.toggle('show');
    }
}
