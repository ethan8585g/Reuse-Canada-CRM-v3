import { layout } from '../utils/layout'

export function renderDriverPortal(): string {
  return layout('Driver Portal', `
  <div class="min-h-screen bg-gray-50">
    <!-- Top Bar -->
    <div class="bg-rc-green text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-lg">
      <div class="flex items-center gap-3">
        <div>
          <div class="font-bold text-lg">Driver Portal</div>
          <div class="text-xs text-green-200">Reuse Canada Tire Pickup</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-green-200" id="driver-name"></span>
        <button onclick="handleDriverLogout()" class="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>

    <div class="max-w-2xl mx-auto p-4">
      <!-- Status Toggle -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-bold text-gray-600 uppercase">Your Status</div>
            <div class="text-lg font-bold mt-1" id="driver-status-text">Idle at Yard</div>
          </div>
          <div class="flex gap-2">
            <button onclick="setDriverStatus('idle')" id="btn-idle" class="px-4 py-2 rounded-xl text-sm font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all">
              <i class="fas fa-warehouse mr-1"></i> At Yard
            </button>
            <button onclick="setDriverStatus('on_road')" id="btn-onroad" class="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 transition-all">
              <i class="fas fa-road mr-1"></i> On Road
            </button>
          </div>
        </div>
      </div>

      <!-- Assigned Pickups -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
        <div class="p-5 border-b border-gray-100">
          <h2 class="font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-tasks text-rc-green"></i> My Assigned Pickups
          </h2>
        </div>
        <div id="driver-pickups" class="divide-y divide-gray-50">
          <div class="p-6 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Loading...</div>
        </div>
      </div>

      <!-- Upload Proof of Work Modal -->
      <div id="proof-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" style="display:none">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div class="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-800"><i class="fas fa-camera mr-2 text-rc-green"></i>Proof of Pickup</h3>
            <button onclick="closeProofModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
          </div>
          <div class="p-5">
            <p class="text-sm text-gray-500 mb-4">Take a photo of the cage/bin to confirm pickup. GPS location and timestamp will be recorded automatically.</p>
            <input type="hidden" id="proof-pickup-id">
            <div class="mb-4">
              <div id="proof-photo-area" class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 cursor-pointer hover:border-rc-green hover:bg-green-50 transition-all" onclick="document.getElementById('proof-camera').click()">
                <i class="fas fa-camera text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500 font-semibold text-sm">Tap to Take Photo</p>
                <p class="text-gray-400 text-xs">of cage/bin at location</p>
              </div>
              <img id="proof-preview" class="hidden w-full rounded-xl border-2 border-rc-green mt-2" alt="Proof photo">
              <input type="file" id="proof-camera" accept="image/*" capture="environment" class="hidden" onchange="handleProofPhoto(event)">
            </div>
            <div class="bg-blue-50 rounded-xl p-3 mb-4">
              <div class="flex items-center gap-2 text-sm text-blue-700">
                <i class="fas fa-map-marker-alt"></i>
                <span id="proof-gps-status">Getting GPS location...</span>
              </div>
              <div class="text-xs text-blue-500 mt-1" id="proof-gps-coords"></div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-600 mb-1">Notes (optional)</label>
              <textarea id="proof-notes" rows="2" class="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-rc-green outline-none" placeholder="Any notes about the pickup..."></textarea>
            </div>
            <button onclick="submitProof()" id="proof-submit-btn" class="w-full bg-rc-green hover:bg-rc-green-light text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50" disabled>
              <i class="fas fa-check mr-1"></i> Submit Proof & Notify Customer
            </button>
          </div>
        </div>
      </div>

      <!-- Notification Success Toast -->
      <div id="proof-toast" class="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 transform translate-x-full transition-transform duration-300">
        <div class="flex items-center gap-3">
          <i class="fas fa-check-circle text-xl"></i>
          <div>
            <div class="font-bold text-sm">Proof Submitted!</div>
            <div class="text-xs text-green-100" id="proof-toast-msg">Customer notified</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Auth check — must be employee with driver role
    const session = JSON.parse(localStorage.getItem('rc_session') || '{}');
    if (!session.token || session.user_type !== 'employee') {
      window.location.href = '/login';
    }

    // Axios setup
    function setupDriverAxios() {
      if (typeof axios === 'undefined') { setTimeout(setupDriverAxios, 200); return; }
      axios.interceptors.request.use(config => {
        const s = JSON.parse(localStorage.getItem('rc_session') || '{}');
        if (s.token) config.headers.Authorization = 'Bearer ' + s.token;
        return config;
      });
      axios.interceptors.response.use(r => r, err => {
        if (err.response?.status === 401) { localStorage.removeItem('rc_session'); window.location.href = '/login'; }
        return Promise.reject(err);
      });
    }
    setupDriverAxios();

    document.getElementById('driver-name').textContent = session.name || 'Driver';

    let proofPhotoData = null;
    let proofLat = null;
    let proofLng = null;

    function handleDriverLogout() {
      localStorage.removeItem('rc_session');
      window.location.href = '/login';
    }

    // ═══ DRIVER STATUS ═══
    async function setDriverStatus(status) {
      try {
        await axios.post('/api/employee/driver-status', {
          employee_id: session.user_id,
          status: status
        });
        updateStatusUI(status);
      } catch (err) { console.error(err); }
    }

    function updateStatusUI(status) {
      const btnIdle = document.getElementById('btn-idle');
      const btnOnRoad = document.getElementById('btn-onroad');
      const statusText = document.getElementById('driver-status-text');
      if (status === 'on_road') {
        btnOnRoad.className = 'px-4 py-2 rounded-xl text-sm font-bold bg-green-500 text-white';
        btnIdle.className = 'px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-all';
        statusText.textContent = 'On Road';
        statusText.className = 'text-lg font-bold mt-1 text-green-600';
      } else {
        btnIdle.className = 'px-4 py-2 rounded-xl text-sm font-bold bg-blue-500 text-white';
        btnOnRoad.className = 'px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 transition-all';
        statusText.textContent = 'Idle at Yard';
        statusText.className = 'text-lg font-bold mt-1 text-blue-600';
      }
    }

    // ═══ ASSIGNED PICKUPS ═══
    async function loadDriverPickups() {
      try {
        const res = await axios.get('/api/pickups?status=scheduled,in_progress');
        const pickups = (res.data.pickups || []).filter(p => p.assigned_employee_id === session.user_id);
        const container = document.getElementById('driver-pickups');

        if (pickups.length === 0) {
          container.innerHTML = '<div class="p-6 text-center text-gray-400"><i class="fas fa-inbox text-3xl mb-2 block"></i>No assigned pickups</div>';
          return;
        }

        container.innerHTML = pickups.map(p => \`
          <div class="p-4 hover:bg-gray-50 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <div>
                <div class="font-bold text-gray-800">\${p.company_name || 'Unknown'}</div>
                <div class="text-xs text-gray-500"><i class="fas fa-map-marker-alt mr-1"></i>\${p.address || ''}, \${p.city || ''}</div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold \${p.status === 'in_progress' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}">
                \${p.status.replace('_',' ').toUpperCase()}
              </span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <span><i class="fas fa-tire mr-1"></i>\${p.estimated_tire_count || '?'} tires</span>
              <span><i class="fas fa-calendar mr-1"></i>\${p.preferred_date || 'Today'}</span>
            </div>
            <div class="flex gap-2">
              \${p.status === 'scheduled' ? \`
                <button onclick="startPickup(\${p.id})" class="flex-1 px-3 py-2 bg-orange-100 text-orange-700 text-sm font-semibold rounded-lg hover:bg-orange-200">
                  <i class="fas fa-truck mr-1"></i> Start Pickup
                </button>
              \` : ''}
              <button onclick="openProofModal(\${p.id}, '\${(p.company_name || '').replace(/'/g, "\\\\'")}')" class="flex-1 px-3 py-2 bg-rc-green text-white text-sm font-semibold rounded-lg hover:bg-rc-green-light">
                <i class="fas fa-camera mr-1"></i> Upload Proof
              </button>
              \${p.status === 'in_progress' ? \`
                <button onclick="completePickup(\${p.id})" class="px-3 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-200">
                  <i class="fas fa-check"></i>
                </button>
              \` : ''}
            </div>
          </div>
        \`).join('');
      } catch (err) { console.error(err); }
    }

    async function startPickup(id) {
      try {
        await axios.post('/api/pickups/' + id + '/status', { status: 'in_progress' });
        setDriverStatus('on_road');
        loadDriverPickups();
      } catch (err) { alert('Failed to start pickup'); }
    }

    async function completePickup(id) {
      if (!confirm('Mark this pickup as completed?')) return;
      try {
        await axios.post('/api/pickups/' + id + '/status', { status: 'completed' });
        loadDriverPickups();
      } catch (err) { alert('Failed to complete pickup'); }
    }

    // ═══ PROOF OF WORK ═══
    function openProofModal(pickupId, customerName) {
      document.getElementById('proof-pickup-id').value = pickupId;
      proofPhotoData = null;
      proofLat = null;
      proofLng = null;
      document.getElementById('proof-preview').classList.add('hidden');
      document.getElementById('proof-photo-area').classList.remove('hidden');
      document.getElementById('proof-notes').value = '';
      document.getElementById('proof-submit-btn').disabled = true;
      document.getElementById('proof-modal').style.display = 'flex';
      // Get GPS
      if (navigator.geolocation) {
        document.getElementById('proof-gps-status').textContent = 'Getting GPS location...';
        navigator.geolocation.getCurrentPosition(
          pos => {
            proofLat = pos.coords.latitude;
            proofLng = pos.coords.longitude;
            document.getElementById('proof-gps-status').textContent = 'Location captured';
            document.getElementById('proof-gps-coords').textContent = proofLat.toFixed(6) + ', ' + proofLng.toFixed(6);
          },
          err => {
            document.getElementById('proof-gps-status').textContent = 'GPS unavailable — will use timestamp only';
            document.getElementById('proof-gps-coords').textContent = '';
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        document.getElementById('proof-gps-status').textContent = 'GPS not supported on this device';
      }
    }

    function closeProofModal() {
      document.getElementById('proof-modal').style.display = 'none';
    }

    function handleProofPhoto(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        proofPhotoData = e.target.result;
        document.getElementById('proof-preview').src = proofPhotoData;
        document.getElementById('proof-preview').classList.remove('hidden');
        document.getElementById('proof-photo-area').classList.add('hidden');
        document.getElementById('proof-submit-btn').disabled = false;
      };
      reader.readAsDataURL(file);
    }

    async function submitProof() {
      const btn = document.getElementById('proof-submit-btn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Submitting...';
      try {
        const res = await axios.post('/api/employee/pickup-proof', {
          pickup_request_id: parseInt(document.getElementById('proof-pickup-id').value),
          photo_data: proofPhotoData,
          latitude: proofLat,
          longitude: proofLng,
          notes: document.getElementById('proof-notes').value
        });
        closeProofModal();
        // Show toast
        const toast = document.getElementById('proof-toast');
        document.getElementById('proof-toast-msg').textContent = res.data.message || 'Customer notified';
        toast.style.transform = 'translateX(0)';
        setTimeout(() => { toast.style.transform = 'translateX(150%)'; }, 4000);
        loadDriverPickups();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to submit proof');
      }
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check mr-1"></i> Submit Proof & Notify Customer';
    }

    (function init() {
      if (typeof axios !== 'undefined') { loadDriverPickups(); }
      else { setTimeout(init, 500); }
    })();
  </script>
  `)
}
