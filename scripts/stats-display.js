// Stats Display Module
// Handles displaying statistics in the stats panel

let currentFilter = 'all';

// Function to load stats (can be called from outside)
function loadStatsInPanel() {
    let stats = StatsManager.getAllStats();
    
    // Apply filter
    if (currentFilter !== 'all') {
        if (currentFilter === 'words' || currentFilter === 'sentence') {
            stats = stats.filter(s => s.gameType === currentFilter);
        } else if (currentFilter === 'time-based' || currentFilter === 'word-based') {
            stats = stats.filter(s => s.gameMode === currentFilter);
        }
    }
    
    const statsContent = document.getElementById('statsContent');
    
    if (stats.length === 0) {
        statsContent.innerHTML = '<div class="no-stats"><p>No statistics available for this filter.</p></div>';
        return;
    }
    
    // Build table
    const tableHtml = buildStatsTable(stats);
    statsContent.innerHTML = tableHtml;
    
    // Add click handlers for expand buttons
    const expandButtons = statsContent.querySelectorAll('.expand-btn');
    expandButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const extendedRow = document.getElementById(`extended-${index}`);
            if (extendedRow.style.display === 'none') {
                extendedRow.style.display = 'table-row';
                this.textContent = '▾';
            } else {
                extendedRow.style.display = 'none';
                this.textContent = '▸';
            }
        });
    });
    
    // Reinitialize tooltips for the new content
    if (typeof tippy !== 'undefined') {
        tippy('[data-tippy-content]', {
            placement: 'top',
            arrow: true
        });
    }
}

function buildStatsTable(stats) {
    let html = '<table class="stats-table">';
    html += '<thead><tr>';
    html += '<th>Date</th>';
    html += '<th>Type/Mode</th>';
    html += '<th>Level</th>';
    html += '<th>Words</th>';
    html += '<th>WPM</th>';
    html += '<th>Acc</th>';
    html += '<th>Time</th>';
    html += '<th></th>'; // Expand column
    html += '</tr></thead>';
    html += '<tbody>';
    
    stats.forEach((stat, index) => {
        html += '<tr>';
        
        // Date & Time with tooltip showing absolute timestamp
        const date = new Date(stat.timestamp);
        const formattedDate = formatDate(date);
        const absoluteDate = date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        html += `<td><span data-tippy-content="${absoluteDate}">${formattedDate}</span></td>`;
        
        // Type with tooltip
        const typeBadge = stat.gameType === 'sentence' ? 
            '<span class="badge badge-sentence" data-tippy-content="Sentence">S</span>' : 
            '<span class="badge badge-words" data-tippy-content="Words">W</span>';
        const modeBadge = stat.gameMode === 'time-based' ? 
            '<span class="badge badge-time" data-tippy-content="Time-based">T</span>' : 
            '<span class="badge badge-word" data-tippy-content="Word-based">W</span>';
        html += `<td>${typeBadge} ${modeBadge}</td>`;
            
        // Level
        html += `<td>${stat.settings.level}</td>`;
        
        // Words
        const words = stat.performance.words || stat.performance.wordsTyped || 0;
        html += `<td>${words}</td>`;
        
        // WPM with color coding
        const wpm = stat.performance.wpm;
        const wpmClass = wpm >= 60 ? 'wpm-good' : (wpm >= 40 ? 'wpm-medium' : 'wpm-low');
        html += `<td><span class="${wpmClass}">${wpm.toFixed(0)}</span></td>`;
        
        // Accuracy with color coding
        const accuracy = stat.performance.accuracy;
        const accuracyClass = accuracy >= 95 ? 'accuracy-high' : (accuracy >= 85 ? 'accuracy-medium' : 'accuracy-low');
        html += `<td><span class="${accuracyClass}">${accuracy.toFixed(0)}%</span></td>`;
        
        // Time
        html += `<td>${formatTime(stat.performance.time)}</td>`;
        
        // Expand button
        html += `<td><span class="expand-btn" data-index="${index}">▸</span></td>`;
        
        html += '</tr>';
        
        // Extended info row (hidden by default)
        html += `<tr class="extended-info" id="extended-${index}" style="display: none;">`;
        html += `<td colspan="9">`;
        html += `<div class="extended-content">`;
        html += `<strong>Layout:</strong> ${(stat.settings.layout)}<br>`;
        html += `<strong>Keyboard:</strong> ${capitalize(stat.settings.keyboard)}<br>`;
        if (stat.settings.keyRemapping !== undefined) {
            html += `<strong>Key remapping:</strong> ${stat.settings.keyRemapping ? 'Yes' : 'No'}<br>`;
        }
        if (stat.settings.language !== undefined) {`x`
            html += `<strong>Language:</strong> ${stat.settings.language}<br>`;
        }
        if (stat.settings.capitalLettersAllowed !== undefined) {
            html += `<strong>Capital letters:</strong> ${stat.settings.capitalLettersAllowed ? 'Yes' : 'No'}<br>`;
        }
        if (stat.settings.nonLatinLetters !== undefined) {
            html += `<strong>Non-Latin letters:</strong> ${stat.settings.nonLatinLetters ? 'Yes' : 'No'}<br>`;
        }
        if (stat.settings.punctuation !== undefined && stat.settings.punctuation !== '') {
            html += `<strong>Punctuation:</strong> ${stat.settings.punctuation || 'None'}<br>`;
        }
        html += `</div>`;
        html += `</td></tr>`;
    });
    
    html += '</tbody></table>';
    return html;
}

function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    // If today
    if (days === 0) {
        if (hours === 0) {
            if (minutes === 0) {
                return 'Now';
            }
            return `${minutes}m`;
        }
        return `${hours}h`;
    }
    
    // If this week
    if (days < 7) {
        return `${days}d`;
    }
    
    // Otherwise show date
    const options = { 
        month: 'short', 
        day: 'numeric'
    };
    
    // Add year if not current year
    if (date.getFullYear() !== now.getFullYear()) {
        options.year = 'numeric';
    }
    
    return date.toLocaleDateString('en-US', options);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Set up event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Set up filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update filter and reload
            currentFilter = this.dataset.filter;
            loadStatsInPanel();
        });
    });
    
    // Set up clear stats button
    const clearButton = document.getElementById('clearStats');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete all statistics? This cannot be undone.')) {
                StatsManager.clearAllStats();
                loadStatsInPanel();
            }
        });
    }
});
