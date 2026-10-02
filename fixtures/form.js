document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form));
  const error = document.querySelector('#form-error');
  if (values.name !== 'Ada Lovelace' || values.email !== 'ada@example.com' || values.topic !== 'Research') {
    error.textContent = 'The details do not match the benchmark task. Check all three fields and try again.';
    error.hidden = false;
    return;
  }
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const receipt = 'PACES-' + Array.from(bytes, x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  document.querySelector('#receipt').textContent = receipt;
  for (const field of ['name', 'email', 'topic']) document.querySelector('#submitted-' + field).textContent = values[field];
  document.querySelector('#form-panel').hidden = true;
  document.querySelector('#confirmation').hidden = false;
  document.querySelector('#confirmation-title').focus();
});
