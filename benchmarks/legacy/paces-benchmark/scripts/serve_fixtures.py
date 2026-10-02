#!/usr/bin/env python3
"""Serve synthetic test pages, without providing any agent capabilities."""
import argparse
import json
import secrets
from datetime import datetime, timezone
from html import escape
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit


def page(title, body):
    return (f'<!doctype html><html lang="en"><meta charset="utf-8">'
            f'<meta name="viewport" content="width=device-width"><title>{escape(title)}</title>'
            '<style>body{font:18px system-ui;max-width:840px;margin:50px auto;padding:24px;'
            'background:#f7f7f3;color:#252b29}label{display:block;margin:20px 0}'
            'input,select,button{font:inherit;padding:12px;border:1px solid #bbb;border-radius:6px}'
            'input{display:block;max-width:90%}button{background:#245d4a;color:white}'
            'td,th{padding:20px;text-align:left;border-bottom:1px solid #ccc}'
            'table{width:100%;border-collapse:collapse}</style>'
            f'<p>SYNTHETIC AGENT EVALUATION</p><h1>{escape(title)}</h1>{body}</html>').encode()


def make_server(output, port=4320):
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    # Refuse accidental ledger overwrite or mixing independent attempts.
    if any(output.iterdir()):
        raise ValueError('Use an empty evidence directory for each fixture session.')
    case_id = secrets.token_hex(16)
    prefix = f'/case/{case_id}'

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass

        def send(self, status, content):
            self.send_response(status)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'")
            self.end_headers()
            self.wfile.write(content)

        def permitted(self):
            origins = {f'http://127.0.0.1:{self.server.server_port}', f'http://localhost:{self.server.server_port}'}
            valid = ('http://' + self.headers.get('Host', '')) in origins
            valid &= not self.headers.get('Origin') or self.headers['Origin'] in origins
            if not valid:
                self.send(403, page('Request blocked', '<p>Use this local fixture origin.</p>'))
            return valid

        def do_GET(self):
            if not self.permitted():
                return
            path = urlsplit(self.path).path
            if path == prefix + '/form':
                self.send(200, page('Get in touch', '<form action="submitted" method="post">'
                    '<label>Name<input name="name" required></label>'
                    '<label>Email<input type="email" name="email" required></label>'
                    '<label>Topic <select name="topic" required><option value="">Choose a topic</option>'
                    '<option>Support</option><option>Research</option><option>Sales</option></select></label>'
                    '<button>Send request</button></form>'))
            elif path == prefix + '/plans':
                self.send(200, page('Choose your workspace', '<p>All prices are per month. No additional fees.</p>'
                    '<table><tr><th>Plan</th><th>Price</th><th>Projects</th></tr>'
                    '<tr><td>Personal</td><td>$8</td><td>3</td></tr>'
                    '<tr><td>Studio</td><td>$18</td><td>12</td></tr>'
                    '<tr><td>Company</td><td>$45</td><td>Unlimited</td></tr></table>'))
            else:
                self.send(404, page('Page not found', '<p>Use the fixture URL supplied by the operator.</p>'))

        def do_POST(self):
            if not self.permitted():
                return
            if urlsplit(self.path).path != prefix + '/submitted':
                self.send(404, page('Page not found', ''))
                return
            try:
                size = int(self.headers.get('Content-Length', '0'))
                if not 0 < size <= 8192:
                    raise ValueError()
                values = parse_qs(self.rfile.read(size).decode('utf-8'), strict_parsing=True)
            except (ValueError, UnicodeDecodeError):
                self.send(400, page('Invalid submission', '<p>Submit the fixture form.</p>'))
                return
            expected = {'name': ['Ada Lovelace'], 'email': ['ada@example.com'], 'topic': ['Research']}
            valid = values == expected
            receipt = 'PACES-' + secrets.token_hex(4).upper() if valid else None
            entry = {'case_id': case_id, 'at': datetime.now(timezone.utc).isoformat(),
                     'valid': valid, 'values': values, 'receipt': receipt}
            with (output / 'submissions.jsonl').open('a', encoding='utf-8') as f:
                f.write(json.dumps(entry) + '\n')
            if valid:
                self.send(200, page('Request received', f'<p>Name: Ada Lovelace<br>Email: ada@example.com<br>Topic: Research</p>'
                    f'<p>Confirmation code: <strong>{receipt}</strong></p>'))
            else:
                self.send(422, page('Check your details', '<p>The details did not match the task.</p><a href="form">Back to form</a>'))

    server = HTTPServer(('127.0.0.1', port), Handler)
    info = {'suite_id': 'paces-portable-v1', 'case_id': case_id,
            'fixture_base_url': f'http://127.0.0.1:{server.server_port}{prefix}'}
    (output / 'fixture-info.json').write_text(json.dumps(info, indent=2) + '\n', encoding='utf-8')
    template = (Path(__file__).resolve().parents[1] / 'assets' / 'invocation-template.txt').read_text(encoding='utf-8')
    (output / 'invocation.txt').write_text(template.replace('FIXTURE_BASE_URL', info['fixture_base_url']), encoding='utf-8')
    return server, info


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4320)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    try:
        server, info = make_server(args.output, args.port)
    except (ValueError, OSError) as error:
        parser.exit(1, str(error) + '\n')
    print(json.dumps(info, indent=2), flush=True)
    print(f'Ready-to-send prompt: {(args.output / "invocation.txt").resolve()}', flush=True)
    print('Test pages only. Keep the submission ledger for independent review. Ctrl+C stops.', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
