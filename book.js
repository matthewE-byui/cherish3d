// Simple client-side booking validator for Cherish3D
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('bookingForm');
  const msg = document.getElementById('bookingMessage');
  const businessStart = 9; // 9:00
  const businessEnd = 17; // 17:00

  function isBusinessDay(date){
    // Mon = 1, Sun = 0; we allow Mon-Sat => 1..6
    const d = date.getDay();
    return d >= 1 && d <= 6;
  }

  function parseTime(str){
    if(!str) return null;
    const [hh,mm] = str.split(':').map(s=>parseInt(s,10));
    if(Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return { hh, mm };
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    msg.textContent = '';
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const dateStr = form.date.value;
    const hour = form.timeHour?.value;
    const min = form.timeMin?.value;
    if(!name || !email || !dateStr || !hour || !min){
      msg.textContent = 'Please complete all fields.';
      return;
    }

    const date = new Date(dateStr + 'T00:00:00');
    if(!isBusinessDay(date)){
      msg.textContent = 'Appointments are by appointment only, Monday through Saturday. Please choose a weekday or Saturday.';
      return;
    }

    const t = { hh: parseInt(hour,10), mm: parseInt(min,10) };
    if(Number.isNaN(t.hh) || Number.isNaN(t.mm)) { msg.textContent = 'Please enter a valid time.'; return; }
    // Allow times from businessStart:00 up to and including businessEnd:00 (17:00 only allowed when minutes === 0)
    if(t.hh < businessStart || t.hh > businessEnd || (t.hh === businessEnd && t.mm > 0)){
      msg.textContent = `Our hours are ${businessStart}:00 to ${businessEnd}:00. Please choose a time within these hours.`;
      return;
    }

    // Mock confirmation — in a real site you'd POST to a server / scheduling API
  const timeStr = (hour.padStart ? hour.padStart(2,'0') : hour) + ':' + (min.padStart ? min.padStart(2,'0') : min);
  msg.textContent = `Thanks ${name}! Your appointment request for ${dateStr} at ${timeStr} has been received. We'll follow up at ${email} to confirm.`;
    form.reset();
  });
});
