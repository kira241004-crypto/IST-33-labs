document.addEventListener('DOMContentLoaded', () => {

    // --- Data & Config ---
    const sessionTimes = ['10:40', '13:10', '15:40', '18:10', '20:35', '23:00'];
    const PRICES = {
        standard: 600,
        comfort: 600,
        wheelchair: 600
    };

    // ===================
    // SEAT LAYOUT (Вариант 6)
    // ===================
    //
    // 1 = стандарт (Место)
    // 2 = комфорт (Кресло-подушка в 1 ряду)
    //
    // Ряды центрируются CSS (flex center), поэтому 0 (пробелы) не нужны,
    // если нет проходов внутри ряда.

    // 1 ряд: 8 мест (Кресло-подушка)
    const row1 = Array(8).fill(2);

    // 2 ряд: 8 мест (Стандарт)
    const row2 = Array(8).fill(1);

    // 3 ряд: 10 мест (Стандарт)
    const row3 = Array(10).fill(1);

    // 4 ряд: 12 мест (Стандарт)
    const row4 = Array(12).fill(1);

    // 5 ряд: 14 мест (Стандарт)
    const row5 = Array(14).fill(1);

    // 6 ряд: 16 мест (Стандарт)
    const row6 = Array(16).fill(1);

    const layoutConfig = [
        { row: 1, seats: row1 },
        { row: 2, seats: row2 },
        { row: 3, seats: row3 },
        { row: 4, seats: row4 },
        { row: 5, seats: row5 },
        { row: 6, seats: row6 }
    ];

    // State
    let selectedSeats = new Set();

    // Elements
    const gridEl = document.getElementById('seats-grid');
    const dateEl = document.getElementById('session-date');
    const timeEl = document.getElementById('session-time');
    const selectedListEl = document.getElementById('selected-seats-list');
    const selectedPanel = document.getElementById('selected-panel');
    const btnContinue = document.getElementById('btn-continue');
    const btnBuyAll = document.getElementById('btn-buy-all');

    const gapModal = document.getElementById('gap-modal');
    const btnCloseGap = document.getElementById('btn-close-gap');

    const buyAllModal = document.getElementById('buy-all-modal');
    const btnConfirmBuyAll = document.getElementById('btn-confirm-buy-all');
    const btnCancelBuyAll = document.getElementById('btn-cancel-buy-all');
    const btnCloseBuyAllX = document.getElementById('btn-close-buy-all-x');

    const seatTemplate = document.getElementById('seat-template');
    const ticketTemplate = document.getElementById('ticket-template');
    const removeTemplate = document.getElementById('remove-template'); // Cross
    const wheelchairTemplate = document.getElementById('wheelchair-icon-template');

    // --- Init Dates ---
    function initSessionInfo() {
        const now = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('ru-RU', options);
        // Random time
        const randomTime = sessionTimes[Math.floor(Math.random() * sessionTimes.length)];
        timeEl.textContent = randomTime;
    }

    // --- Init Grid ---
    function initGrid() {
        gridEl.innerHTML = '';

        layoutConfig.forEach(rowConfig => {
            const rowEl = document.createElement('div');
            rowEl.className = 'seat-row';

            // Left label
            const labelLeft = document.createElement('span');
            labelLeft.className = 'row-label left';
            labelLeft.textContent = rowConfig.row;
            rowEl.appendChild(labelLeft);

            let seatNum = 1;

            rowConfig.seats.forEach(type => {
                if (type === 0) {
                    // Simple Gap
                    const gap = document.createElement('div');
                    gap.style.width = '32px';
                    rowEl.appendChild(gap);
                } else if (type === 4) {
                    // Wheelchair Spot - Now Selectable
                    const wc = document.createElement('div');
                    wc.className = 'seat wheelchair';
                    // Add attributes for selection logic
                    wc.dataset.row = rowConfig.row;
                    wc.dataset.seat = seatNum; // Uses same numbering logic? Or specific? Screenshot implies just position.
                    // Assuming seatNum increment applies.
                    wc.dataset.type = 'wheelchair';
                    wc.dataset.price = PRICES.wheelchair;

                    const uid = `${rowConfig.row}_${seatNum}`;
                    wc.id = `seat-${uid}`;

                    const icon = wheelchairTemplate.content.cloneNode(true);
                    wc.appendChild(icon);

                    // Add standard interaction elements (though hidden by CSS for wheelchair usually, we need them for state changes if we want standardized "pink" effect?)
                    // The user wants it "active".
                    // If active -> click -> selected state.
                    // Wheelchair seat usually stays as wheelchair icon but changes color? 
                    // Or works like others (icon changes)? 
                    // Let's add the standard icons hiddenly so if we want to toggle them we can, 
                    // but primarily we might just tint the WC icon. 
                    // CSS for .seat.wheelchair.selected needs to be checked.
                    // For now, let's attach the click listener.

                    // Add hover/selected icons just in case (Receipt/Chair)
                    const ticketIcon = ticketTemplate.content.cloneNode(true).querySelector('svg');
                    ticketIcon.classList.add('icon-ticket');

                    const removeIcon = removeTemplate.content.cloneNode(true).querySelector('svg');
                    removeIcon.classList.add('icon-remove');

                    wc.appendChild(ticketIcon);
                    wc.appendChild(removeIcon);

                    wc.addEventListener('click', () => handleSeatClick(wc));

                    rowEl.appendChild(wc);
                    // seatNum++; // Does wheelchair count as a number? 
                    // In previous logic Row 1 had "8 Std, Gap, WC, Gap, 8 Std". 
                    // Std seats take numbers 1-8. WC takes next?
                    // Let's increment to ensure unique IDs.
                    seatNum++;
                } else {
                    const seat = document.createElement('div');
                    seat.className = 'seat';
                    seat.dataset.row = rowConfig.row;
                    seat.dataset.seat = seatNum;
                    seat.dataset.type = type === 2 ? 'comfort' : 'standard';
                    seat.dataset.price = type === 2 ? PRICES.comfort : PRICES.standard; // 410 or 460

                    const uid = `${rowConfig.row}_${seatNum}`;
                    seat.id = `seat-${uid}`;

                    const chairIcon = seatTemplate.content.cloneNode(true).querySelector('svg');
                    chairIcon.classList.add('icon-chair');

                    const ticketIcon = ticketTemplate.content.cloneNode(true).querySelector('svg');
                    ticketIcon.classList.add('icon-ticket');

                    const removeIcon = removeTemplate.content.cloneNode(true).querySelector('svg');
                    removeIcon.classList.add('icon-remove');

                    if (type === 2) seat.classList.add('comfort');

                    seat.appendChild(chairIcon);
                    seat.appendChild(ticketIcon);
                    seat.appendChild(removeIcon);

                    seat.addEventListener('click', () => handleSeatClick(seat));

                    rowEl.appendChild(seat);
                    seatNum++;
                }
            });

            // Right label
            const labelRight = document.createElement('span');
            labelRight.className = 'row-label right';
            labelRight.textContent = rowConfig.row;
            rowEl.appendChild(labelRight);

            gridEl.appendChild(rowEl);
        });
    }

    // --- Interaction ---
    function handleSeatClick(seat) {
        if (seat.classList.contains('occupied')) return;

        const uid = seat.id;

        if (seat.classList.contains('selected')) {
            toggleSelection(seat, false);
        } else {
            // Validate Gap
            if (hasGapError(seat)) {
                shakeScreen();
                showGapModal();
                return;
            }
            toggleSelection(seat, true);
        }
    }

    function toggleSelection(seat, isSelected) {
        if (isSelected) {
            seat.classList.add('selected');
            selectedSeats.add(seat.id);
        } else {
            seat.classList.remove('selected');
            selectedSeats.delete(seat.id);
        }
        updateUI();
    }

    // Check for gaps logic - improved to handle edge cases
    function checkLoc(r, s) {
        const el = document.getElementById(`seat-${r}_${s}`);
        if (!el) return 'wall'; // End of row or gap
        if (el.classList.contains('occupied')) return 'taken';
        if (el.classList.contains('selected')) return 'taken';
        return 'empty';
    }

    function hasGapError(targetSeat) {
        const row = targetSeat.dataset.row;
        const seatNum = parseInt(targetSeat.dataset.seat);

        // Gap check rule: Do not leave EXACTLY 1 empty seat between selection and another taken/wall.
        // Actually wall is fine? "выбирайте соседние места или с промежутком не менее двух мест"
        // This means "Select neighbor OR leave >= 2 gap".
        // So, forbidden: Gap == 1.

        // Check Left Gap
        // Left Neighbor (L1) is empty?
        const L1 = checkLoc(row, seatNum - 1);
        const L2 = checkLoc(row, seatNum - 2);

        if (L1 === 'empty' && L2 === 'taken') {
            // Creating a 1-seat gap on the left
            return true;
        }

        // Check Right Gap
        const R1 = checkLoc(row, seatNum + 1);
        const R2 = checkLoc(row, seatNum + 2);

        if (R1 === 'empty' && R2 === 'taken') {
            return true;
        }

        return false;
    }

    function shakeScreen() {
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 300);
    }

    // --- Modals ---
    function showGapModal() {
        gapModal.classList.remove('hidden');
    }

    btnCloseGap.addEventListener('click', () => {
        gapModal.classList.add('hidden');
    });

    function showBuyAllModal() {
        buyAllModal.classList.remove('hidden');
    }

    function hideBuyAllModal() {
        buyAllModal.classList.add('hidden');
    }

    btnCancelBuyAll.addEventListener('click', hideBuyAllModal);
    btnCloseBuyAllX.addEventListener('click', hideBuyAllModal);
    btnConfirmBuyAll.addEventListener('click', () => {
        hideBuyAllModal();
        buyAllSeats();
    });

    // --- UI Update ---
    function updateUI() {
        selectedListEl.innerHTML = '';
        let total = 0;

        // Convert Set to Array to sort (optional but nice)
        // Let's settle for insertion order or manual sort
        const sortedIds = Array.from(selectedSeats).sort((a, b) => {
            const [rA, sA] = a.replace('seat-', '').split('_').map(Number);
            const [rB, sB] = b.replace('seat-', '').split('_').map(Number);
            if (rA !== rB) return rA - rB;
            return sA - sB;
        });

        sortedIds.forEach(id => {
            const seat = document.getElementById(id);
            const price = parseInt(seat.dataset.price);
            total += price;

            const item = document.createElement('div');
            item.className = 'selected-item';

            let typeText = 'Место';
            if (seat.dataset.type === 'comfort') typeText = 'Комфорт';
            if (seat.dataset.type === 'wheelchair') typeText = 'Место для инв.'; // Shortened for layout


            item.innerHTML = `
                <div class="ticket-info">
                    <span class="ticket-seat">${seat.dataset.row} ряд, ${seat.dataset.seat} место</span>
                </div>
                <div class="ticket-type">
                    <span>${typeText}</span>
                </div>
                <div class="ticket-details">
                    <span class="ticket-badge">Взрослый</span>
                    <span class="ticket-price">${price} ₽</span>
                </div>
                <button class="btn-remove" onclick="removeSeat('${id}')">✕</button>
            `;
            selectedListEl.appendChild(item);
        });

        if (selectedSeats.size > 0) {
            selectedPanel.classList.remove('hidden');
            btnContinue.disabled = false;
            btnContinue.textContent = `ПРОДОЛЖИТЬ: ${total} ₽`;
        } else {
            selectedPanel.classList.add('hidden');
            btnContinue.disabled = true;
            btnContinue.textContent = `ПРОДОЛЖИТЬ`;
        }
    }

    // --- Buy All ---
    btnBuyAll.addEventListener('click', () => {
        showBuyAllModal();
    });

    function buyAllSeats() {
        const seats = gridEl.querySelectorAll('.seat:not(.occupied)');
        seats.forEach(seat => {
            if (!seat.classList.contains('selected')) {
                toggleSelection(seat, true);
            }
        });
    }

    window.removeSeat = (id) => {
        const seat = document.getElementById(id);
        if (seat) toggleSelection(seat, false);
    };

    initSessionInfo();
    initGrid();
    // populateLegend removed as icons are inline in HTML now

});
