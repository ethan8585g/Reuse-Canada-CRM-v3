import { layout } from '../utils/layout'
import { employeePageWrapper } from '../utils/employeeLayout'

export function renderEmployeeDashboard(): string {
  return layout('Employee Dashboard', employeePageWrapper('dashboard', 'Operations Dashboard', `
    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 font-medium">Pending Pickups</div>
            <div class="text-3xl font-bold text-yellow-600 mt-1" id="stat-pending">-</div>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-clock text-xl text-yellow-600"></i>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 font-medium">Today's Routes</div>
            <div class="text-3xl font-bold text-blue-600 mt-1" id="stat-routes">-</div>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-route text-xl text-blue-600"></i>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 font-medium">Open Scale Tickets</div>
            <div class="text-3xl font-bold text-rc-orange mt-1" id="stat-tickets">-</div>
          </div>
          <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-weight text-xl text-rc-orange"></i>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 font-medium">Completed Today</div>
            <div class="text-3xl font-bold text-green-600 mt-1" id="stat-completed">-</div>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-check-circle text-xl text-green-600"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Recent Pickup Requests -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 class="font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-truck-pickup text-rc-green"></i> Recent Pickup Requests
          </h2>
          <a href="/employee/pickups" class="text-sm text-rc-green hover:text-rc-green-light font-medium">View All <i class="fas fa-arrow-right ml-1"></i></a>
        </div>
        <div class="divide-y divide-gray-50" id="recent-pickups">
          <div class="p-6 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Loading...</div>
        </div>
      </div>

      <!-- Recent Scale Tickets -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 class="font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-weight text-rc-orange"></i> Recent Scale Tickets
          </h2>
          <a href="/employee/scale-tickets" class="text-sm text-rc-green hover:text-rc-green-light font-medium">View All <i class="fas fa-arrow-right ml-1"></i></a>
        </div>
        <div class="divide-y divide-gray-50" id="recent-tickets">
          <div class="p-6 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Loading...</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-8">
      <h2 class="font-bold text-gray-800 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="/employee/scale-house" class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover text-center group">
          <div class="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
            <i class="fas fa-balance-scale text-2xl text-rc-orange"></i>
          </div>
          <div class="font-semibold text-gray-700">Scale House</div>
          <div class="text-xs text-gray-400 mt-1">Weigh-in / Weigh-out</div>
        </a>
        <a href="/employee/pickups" class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover text-center group">
          <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
            <i class="fas fa-truck-pickup text-2xl text-green-600"></i>
          </div>
          <div class="font-semibold text-gray-700">Manage Pickups</div>
          <div class="text-xs text-gray-400 mt-1">View & assign requests</div>
        </a>
        <a href="/employee/routing" class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover text-center group">
          <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
            <i class="fas fa-map-marked-alt text-2xl text-blue-600"></i>
          </div>
          <div class="font-semibold text-gray-700">Plan Routes</div>
          <div class="text-xs text-gray-400 mt-1">Optimize today's routes</div>
        </a>
        <a href="/employee/field-form" class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover text-center group">
          <div class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
            <i class="fas fa-tablet-alt text-2xl text-purple-600"></i>
          </div>
          <div class="font-semibold text-gray-700">Field Form</div>
          <div class="text-xs text-gray-400 mt-1">iPad pickup form</div>
        </a>
      </div>
    </div>

    <script>
      async function loadDashboard() {
        try {
          const res = await axios.get('/api/employee/dashboard');
          const d = res.data;
          document.getElementById('stat-pending').textContent = d.pending_pickups || 0;
          document.getElementById('stat-routes').textContent = d.todays_routes || 0;
          document.getElementById('stat-tickets').textContent = d.open_tickets || 0;
          document.getElementById('stat-completed').textContent = d.completed_today || 0;

          // Recent pickups
          const pickupsDiv = document.getElementById('recent-pickups');
          if (d.recent_pickups && d.recent_pickups.length > 0) {
            pickupsDiv.innerHTML = d.recent_pickups.map(p => \`
              <div class="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <div class="font-semibold text-sm text-gray-800">\${p.company_name}</div>
                  <div class="text-xs text-gray-500">\${p.estimated_tire_count} tires - \${p.preferred_date || 'No date'}</div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold \${getStatusClass(p.status)}">
                  \${p.status.replace('_',' ').toUpperCase()}
                </span>
              </div>
            \`).join('');
          } else {
            pickupsDiv.innerHTML = '<div class="p-6 text-center text-gray-400">No recent pickup requests</div>';
          }

          // Recent tickets
          const ticketsDiv = document.getElementById('recent-tickets');
          if (d.recent_tickets && d.recent_tickets.length > 0) {
            ticketsDiv.innerHTML = d.recent_tickets.map(t => \`
              <div class="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <div class="font-semibold text-sm text-gray-800">\${t.ticket_number}</div>
                  <div class="text-xs text-gray-500">\${t.field_store_name || 'N/A'} - \${t.net_weight ? t.net_weight + ' kg' : 'Pending weigh'}</div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold \${getTicketStatusClass(t.status)}">
                  \${t.status.replace('_',' ').toUpperCase()}
                </span>
              </div>
            \`).join('');
          } else {
            ticketsDiv.innerHTML = '<div class="p-6 text-center text-gray-400">No recent scale tickets</div>';
          }
        } catch (err) {
          console.error('Dashboard load error:', err);
        }
      }

      function getStatusClass(status) {
        const map = {
          pending: 'bg-yellow-100 text-yellow-800',
          confirmed: 'bg-blue-100 text-blue-800',
          scheduled: 'bg-indigo-100 text-indigo-800',
          in_progress: 'bg-orange-100 text-orange-800',
          completed: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800'
        };
        return map[status] || 'bg-gray-100 text-gray-800';
      }

      function getTicketStatusClass(status) {
        const map = {
          field_pending: 'bg-yellow-100 text-yellow-800',
          field_complete: 'bg-blue-100 text-blue-800',
          weighing_in: 'bg-indigo-100 text-indigo-800',
          weighed_in: 'bg-purple-100 text-purple-800',
          weighing_out: 'bg-orange-100 text-orange-800',
          completed: 'bg-green-100 text-green-800',
          voided: 'bg-red-100 text-red-800'
        };
        return map[status] || 'bg-gray-100 text-gray-800';
      }

      loadDashboard();
    </script>
  `))
}
