#!/usr/bin/env python3
"""Check visible content-photo reuse across compiled pages (logo/responsive variants exempt)."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import hashlib,json
ROOT=Path(__file__).resolve().parent.parent
DOCS=ROOT/'docs'
class Images(HTMLParser):
 def __init__(self):super().__init__();self.src=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='img' and a.get('src'):self.src.append(a['src'])
seen={};placements=[];duplicates=[];videos=[]
for page in sorted(DOCS.rglob('*.html')):
 html=page.read_text()
 parser=Images();parser.feed(html)
 if '<video ' in html:videos.append({'page':str(page.relative_to(DOCS)), 'video_elements':html.count('<video ')})
 for src in parser.src:
  path=unquote(urlparse(src).path)
  if '/brand/' in path:continue
  asset=(DOCS/path.lstrip('/') if path.startswith('/') else page.parent/path).resolve()
  digest=hashlib.sha256(asset.read_bytes()).hexdigest()
  row={'page':str(page.relative_to(DOCS)),'asset':str(asset.relative_to(DOCS))}
  if digest in seen:duplicates.append({'first':seen[digest],'repeat':row})
  seen[digest]=row;placements.append(row)
report={'video_placements':videos,'content_photo_placements':placements,'duplicate_content_photos':duplicates,'exceptions':['Repeated brand logo','Responsive picture sources and video source encodes on homepage only','Open Graph metadata is not a visible in-page placement']}
(ROOT/'review/unique-imagery/placement-audit.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
if duplicates:raise SystemExit(1)
