const shell = (title, body) => `<!doctype html><meta charset="utf-8"><title>${title}</title><style>body{font:18px system-ui;background:#f4f2ed;color:#20231f;max-width:840px;margin:70px auto;padding:20px}label{display:block;margin:20px 0}input,select,button{font:inherit;padding:12px;border:1px solid #bbb;border-radius:6px}input{display:block;width:90%}button{background:#245d4a;color:white;cursor:pointer}table{width:100%;border-collapse:collapse}td,th{padding:22px;text-align:left;border-bottom:1px solid #ccc}.eyebrow{color:#777;font-size:13px;letter-spacing:2px}</style><p class="eyebrow">PACES · CONTROLLED EVALUATION FIXTURE</p><h1>${title}</h1>${body}`;
export function fixture(path, query, state) {
  if (path === 'plans') return shell('Choose your workspace', '<p>All prices are per month. No additional fees.</p><table><tr><th>Plan</th><th>Price</th><th>Projects</th></tr><tr><td>Personal</td><td>$8</td><td>3</td></tr><tr><td>Studio</td><td>$18</td><td>12</td></tr><tr><td>Company</td><td>$45</td><td>Unlimited</td></tr></table>');
  if (path === 'form') return shell('Get in touch', '<form action="submitted" method="get"><label>Name<input name="name" required></label><label>Email<input type="email" name="email" required></label><label>Topic <select name="topic"><option value="">Select a topic</option><option>Support</option><option>Research</option><option>Sales</option></select></label><button>Send request</button></form>');
  if (path === 'submitted') {
    const valid = query.get('name') === 'Ada Lovelace' && query.get('email') === 'ada@example.com' && query.get('topic') === 'Research';
    if (valid) state.add('form-submitted');
    return shell(valid ? 'Request received' : 'Check your details', valid ? '<p>Your confirmation code is <strong>RELAY-1843</strong>.</p>' : '<p>The details did not match the task. Go back and correct the form.</p><a href="form">Back to form</a>');
  }
  return null;
}
