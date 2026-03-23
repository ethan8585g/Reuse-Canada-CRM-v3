import { layout } from '../utils/layout'
import { employeePageWrapper } from '../utils/employeeLayout'

export function renderScaleTickets(): string {
  return layout('Scale Tickets', employeePageWrapper('scale-tickets', 'Digital Scale Tickets', `
    <!-- Action Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <div class="flex items-center gap-3">
        <select id="filter-status" onchange="loadTickets()" class="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-rc-green outline-none">
          <option value="">All Statuses</option>
          <option value="field_pending">Field Pending</option>
          <option value="field_complete">Field Complete</option>
          <option value="weighing_in">Weighing In</option>
          <option value="weighed_in">Weighed In</option>
          <option value="completed">Completed</option>
          <option value="voided">Voided</option>
        </select>
        <input type="date" id="filter-date" onchange="loadTickets()" class="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-rc-green outline-none">
      </div>
      <button onclick="openNewTicketModal()" class="bg-rc-orange hover:bg-rc-orange-light text-white font-bold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
        <i class="fas fa-plus"></i> New Scale Ticket
      </button>
    </div>

    <!-- Tickets Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ticket #</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Driver</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Weight In</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Weight Out</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Net Weight</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody id="tickets-tbody">
            <tr><td colspan="9" class="px-6 py-8 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- New Ticket Modal -->
    <div id="new-ticket-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4" style="display:none;">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800"><i class="fas fa-weight mr-2 text-rc-orange"></i>New Scale Ticket</h3>
          <button onclick="closeNewTicketModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
        </div>
        <div class="p-6">
          <form id="new-ticket-form" onsubmit="createTicket(event)">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Customer</label>
                <select id="ticket-customer" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rc-orange outline-none">
                  <option value="">Select customer...</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Tire Type</label>
                <select id="ticket-tire-type" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rc-orange outline-none">
                  <option value="mixed">Mixed</option>
                  <option value="passenger">Passenger</option>
                  <option value="truck">Commercial Truck</option>
                  <option value="off-road">Off-Road</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Vehicle</label>
                <select id="ticket-vehicle" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rc-orange outline-none">
                  <option value="">Select vehicle...</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                <textarea id="ticket-notes" rows="2" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rc-orange outline-none" placeholder="Optional notes..."></textarea>
              </div>
            </div>
            <div class="mt-6 flex gap-3">
              <button type="submit" class="flex-1 bg-rc-orange hover:bg-rc-orange-light text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                <i class="fas fa-plus"></i> Create Ticket
              </button>
              <button type="button" onclick="closeNewTicketModal()" class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Weight Entry Modal -->
    <div id="weight-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4" style="display:none;">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-800" id="weight-modal-title">Record Weight</h3>
          <p class="text-sm text-gray-500 mt-1" id="weight-modal-ticket"></p>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
            <input type="number" id="weight-value" step="0.1" min="0" required
              class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-2xl font-bold text-center focus:border-rc-green outline-none"
              placeholder="0.0">
            <p class="text-xs text-gray-400 mt-2 text-center">
              <i class="fas fa-info-circle mr-1"></i>Enter reading from Accuren Apex indicator
            </p>
          </div>
          <div class="flex gap-3">
            <button onclick="submitWeight()" class="flex-1 bg-rc-green hover:bg-rc-green-light text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              <i class="fas fa-save"></i> Record Weight
            </button>
            <button onclick="closeWeightModal()" class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket Detail Modal -->
    <div id="detail-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4" style="display:none;">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800" id="detail-title">Ticket Details</h3>
          <button onclick="closeDetailModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
        </div>
        <div class="p-6" id="detail-content"></div>
      </div>
    </div>

    <script>
      let currentWeightTicketId = null;
      let currentWeightType = null; // 'in' or 'out'

      const ticketStatusColors = {
        field_pending: 'bg-yellow-100 text-yellow-800',
        field_complete: 'bg-blue-100 text-blue-800',
        weighing_in: 'bg-indigo-100 text-indigo-800',
        weighed_in: 'bg-purple-100 text-purple-800',
        weighing_out: 'bg-orange-100 text-orange-800',
        completed: 'bg-green-100 text-green-800',
        voided: 'bg-red-100 text-red-800'
      };

      async function loadTickets() {
        try {
          const status = document.getElementById('filter-status').value;
          const date = document.getElementById('filter-date').value;
          let url = '/api/scale-tickets?';
          if (status) url += 'status=' + status + '&';
          if (date) url += 'date=' + date + '&';
          const res = await axios.get(url);
          const tickets = res.data.tickets || [];
          const tbody = document.getElementById('tickets-tbody');
          
          if (tickets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="px-6 py-8 text-center text-gray-400">No scale tickets found</td></tr>';
            return;
          }

          tbody.innerHTML = tickets.map(t => \`
            <tr class="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onclick="viewTicket(\${t.id})">
              <td class="px-4 py-3 text-sm font-mono font-bold text-rc-green">\${t.ticket_number}</td>
              <td class="px-4 py-3 text-sm text-gray-800">\${t.company_name || t.field_store_name || 'N/A'}</td>
              <td class="px-4 py-3 text-sm text-gray-600">\${t.employee_name || 'N/A'}</td>
              <td class="px-4 py-3">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold \${ticketStatusColors[t.status] || 'bg-gray-100'}">
                  \${t.status.replace(/_/g,' ').toUpperCase()}
                </span>
              </td>
              <td class="px-4 py-3 text-sm font-mono">\${t.weight_in ? t.weight_in.toFixed(1) + ' kg' : '-'}</td>
              <td class="px-4 py-3 text-sm font-mono">\${t.weight_out ? t.weight_out.toFixed(1) + ' kg' : '-'}</td>
              <td class="px-4 py-3 text-sm font-mono font-bold \${t.net_weight ? 'text-rc-green' : 'text-gray-400'}">\${t.net_weight ? t.net_weight.toFixed(1) + ' kg' : '-'}</td>
              <td class="px-4 py-3 text-sm text-gray-500">\${new Date(t.created_at).toLocaleDateString('en-CA')}</td>
              <td class="px-4 py-3 text-center" onclick="event.stopPropagation()">
                <div class="flex items-center justify-center gap-1">
                  \${getTicketActions(t)}
                </div>
              </td>
            </tr>
          \`).join('');
        } catch (err) {
          console.error('Failed to load tickets:', err);
        }
      }

      function getTicketActions(t) {
        let actions = '';
        if (t.status === 'field_complete' || t.status === 'field_pending') {
          actions += \`<button onclick="openWeightModal(\${t.id}, 'in', '\${t.ticket_number}')" class="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-200" title="Record Weight In"><i class="fas fa-arrow-down mr-1"></i>Weigh In</button>\`;
        }
        if (t.status === 'weighed_in') {
          actions += \`<button onclick="openWeightModal(\${t.id}, 'out', '\${t.ticket_number}')" class="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold hover:bg-orange-200" title="Record Weight Out"><i class="fas fa-arrow-up mr-1"></i>Weigh Out</button>\`;
        }
        if (t.status !== 'completed' && t.status !== 'voided') {
          actions += \`<button onclick="voidTicket(\${t.id})" class="px-2 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs hover:bg-red-100" title="Void"><i class="fas fa-ban"></i></button>\`;
        }
        return actions || '<span class="text-xs text-gray-400">-</span>';
      }

      function openNewTicketModal() {
        loadCustomersAndVehicles();
        document.getElementById('new-ticket-modal').style.display = 'flex';
      }
      function closeNewTicketModal() {
        document.getElementById('new-ticket-modal').style.display = 'none';
      }

      function openWeightModal(ticketId, type, ticketNumber) {
        currentWeightTicketId = ticketId;
        currentWeightType = type;
        document.getElementById('weight-modal-title').textContent = type === 'in' ? 'Record Weight In (Gross)' : 'Record Weight Out (Tare)';
        document.getElementById('weight-modal-ticket').textContent = 'Ticket: ' + ticketNumber;
        document.getElementById('weight-value').value = '';
        document.getElementById('weight-modal').style.display = 'flex';
        document.getElementById('weight-value').focus();
      }
      function closeWeightModal() {
        document.getElementById('weight-modal').style.display = 'none';
        currentWeightTicketId = null;
        currentWeightType = null;
      }

      async function submitWeight() {
        const weight = parseFloat(document.getElementById('weight-value').value);
        if (!weight || weight <= 0) { alert('Please enter a valid weight'); return; }
        try {
          await axios.post('/api/scale-tickets/' + currentWeightTicketId + '/weight', {
            type: currentWeightType,
            weight: weight
          });
          closeWeightModal();
          loadTickets();
        } catch (err) {
          alert(err.response?.data?.error || 'Failed to record weight');
        }
      }

      async function loadCustomersAndVehicles() {
        try {
          const [custRes, vehRes] = await Promise.all([
            axios.get('/api/employee/customers'),
            axios.get('/api/employee/vehicles')
          ]);
          const custSelect = document.getElementById('ticket-customer');
          custSelect.innerHTML = '<option value="">Select customer...</option>' + 
            (custRes.data.customers || []).map(c => \`<option value="\${c.id}">\${c.company_name} - \${c.contact_name}</option>\`).join('');
          const vehSelect = document.getElementById('ticket-vehicle');
          vehSelect.innerHTML = '<option value="">Select vehicle...</option>' + 
            (vehRes.data.vehicles || []).map(v => \`<option value="\${v.id}">\${v.name} (\${v.plate_number})</option>\`).join('');
        } catch (err) {
          console.error('Failed to load dropdown data:', err);
        }
      }

      async function createTicket(e) {
        e.preventDefault();
        try {
          await axios.post('/api/scale-tickets', {
            customer_id: parseInt(document.getElementById('ticket-customer').value),
            tire_type: document.getElementById('ticket-tire-type').value,
            notes: document.getElementById('ticket-notes').value
          });
          closeNewTicketModal();
          document.getElementById('new-ticket-form').reset();
          loadTickets();
        } catch (err) {
          alert(err.response?.data?.error || 'Failed to create ticket');
        }
      }

      async function voidTicket(id) {
        if (!confirm('Are you sure you want to void this ticket?')) return;
        try {
          await axios.post('/api/scale-tickets/' + id + '/void');
          loadTickets();
        } catch (err) {
          alert(err.response?.data?.error || 'Failed to void ticket');
        }
      }

      async function viewTicket(id) {
        try {
          const res = await axios.get('/api/scale-tickets/' + id);
          const t = res.data.ticket;
          document.getElementById('detail-title').textContent = 'Ticket ' + t.ticket_number;
          document.getElementById('detail-content').innerHTML = \`
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-bold text-gray-700 mb-3 flex items-center gap-2"><i class="fas fa-info-circle text-rc-green"></i> Ticket Info</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between"><span class="text-gray-500">Ticket #</span><span class="font-mono font-bold">\${t.ticket_number}</span></div>
                  <div class="flex justify-between"><span class="text-gray-500">Status</span><span class="px-2 py-0.5 rounded-full text-xs font-semibold \${ticketStatusColors[t.status]}">\${t.status.replace(/_/g,' ').toUpperCase()}</span></div>
                  <div class="flex justify-between"><span class="text-gray-500">Customer</span><span class="font-semibold">\${t.company_name || 'N/A'}</span></div>
                  <div class="flex justify-between"><span class="text-gray-500">Driver</span><span>\${t.employee_name || 'N/A'}</span></div>
                  <div class="flex justify-between"><span class="text-gray-500">Tire Type</span><span class="capitalize">\${(t.tire_type || 'N/A').replace('_',' ')}</span></div>
                  <div class="flex justify-between"><span class="text-gray-500">Created</span><span>\${new Date(t.created_at).toLocaleString('en-CA')}</span></div>
                </div>
              </div>
              <div>
                <h4 class="font-bold text-gray-700 mb-3 flex items-center gap-2"><i class="fas fa-weight text-rc-orange"></i> Weight Data</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between"><span class="text-gray-500">Weight In (Gross)</span><span class="font-mono font-bold">\${t.weight_in ? t.weight_in.toFixed(1) + ' kg' : 'Pending'}</span></div>
                  <div class="flex justify-between"><span class="text-gray-500">Weight Out (Tare)</span><span class="font-mono font-bold">\${t.weight_out ? t.weight_out.toFixed(1) + ' kg' : 'Pending'}</span></div>
                  <div class="flex justify-between border-t pt-2 mt-2"><span class="text-gray-700 font-semibold">Net Weight</span><span class="font-mono font-bold text-lg \${t.net_weight ? 'text-rc-green' : 'text-gray-400'}">\${t.net_weight ? t.net_weight.toFixed(1) + ' kg' : '-'}</span></div>
                </div>
              </div>
            </div>
            \${t.field_store_name || t.field_signature_data ? \`
            <div class="mt-6 pt-6 border-t border-gray-100">
              <h4 class="font-bold text-gray-700 mb-3 flex items-center gap-2"><i class="fas fa-tablet-alt text-purple-600"></i> Field Data (Customer Site)</h4>
              <div class="grid md:grid-cols-2 gap-4 text-sm">
                <div><span class="text-gray-500">Store Name:</span> <span class="font-semibold">\${t.field_store_name || 'N/A'}</span></div>
                <div><span class="text-gray-500">Employee Name:</span> <span class="font-semibold">\${t.field_employee_name || 'N/A'}</span></div>
                <div><span class="text-gray-500">Est. Tires:</span> <span class="font-semibold">\${t.field_estimated_tires || 'N/A'}</span></div>
                <div><span class="text-gray-500">Field Completed:</span> <span>\${t.field_completed_at ? new Date(t.field_completed_at).toLocaleString('en-CA') : 'N/A'}</span></div>
              </div>
              \${t.field_cage_photo_url ? \`<div class="mt-4"><img src="\${t.field_cage_photo_url}" class="rounded-xl max-h-48 border border-gray-200" alt="Tire cage photo"></div>\` : ''}
              \${t.field_signature_data ? \`<div class="mt-4"><p class="text-xs text-gray-500 mb-1">Customer Signature:</p><img src="\${t.field_signature_data}" class="border border-gray-200 rounded-lg max-h-24 bg-white" alt="Signature"></div>\` : ''}
            </div>
            \` : ''}
            \${t.notes ? \`<div class="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600"><i class="fas fa-sticky-note mr-1"></i> \${t.notes}</div>\` : ''}
          \`;
          document.getElementById('detail-modal').style.display = 'flex';
        } catch (err) {
          alert('Failed to load ticket details');
        }
      }

      function closeDetailModal() {
        document.getElementById('detail-modal').style.display = 'none';
      }

      loadTickets();
    </script>
  `))
}
