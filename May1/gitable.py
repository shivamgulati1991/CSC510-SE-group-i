from __future__ import print_function
import urllib2
import json
import re,datetime
import sys
import json

 
class L():
  "Anonymous container"
  def __init__(i,**fields) : 
    i.override(fields)
  def override(i,d): i.__dict__.update(d); return i
  def __repr__(i):
    d = i.__dict__
    name = i.__class__.__name__
    return name+'{'+' '.join([':%s %s' % (k,pretty(d[k])) 
                     for k in i.show()])+ '}'
  def show(i):
    lst = [str(k)+" : "+str(v) for k,v in i.__dict__.iteritems() if v != None]
    return ',\t'.join(map(str,lst))

  
def secs(d0):
  d     = datetime.datetime(*map(int, re.split('[^\d]', d0)[:-1]))
  epoch = datetime.datetime.utcfromtimestamp(0)
  delta = d - epoch
  return delta.total_seconds()

def dump1(u,issues):
  token = # <===
  request = urllib2.Request(u, headers={"Authorization" : "token "+token})
  v = urllib2.urlopen(request).read()
  w = json.loads(v)
  if not w: return False
  for event in w:
    issue_id = event['issue']['number']
    created_at = event['created_at']
    action = event['event']
    if not event.get('label'):
      label_name='None'
    else:
      label_name = event['label']['name']
    user = event['actor']['login']
    milestone = event['issue']['milestone']
    if milestone != None : milestone = milestone['title']
    eventObj = L(when=created_at,
                 action = action,
                 what = label_name,
                 user = user,
                 milestone = milestone)
    all_events = issues.get(issue_id)
    if not all_events: all_events = []
    all_events.append(eventObj)
    issues[issue_id] = all_events
  return True

def dump(u,issues):
  try:
    return dump1(u, issues)
  except Exception as e: 
    print(e)
    print("Contact TA")
    return False

def launchDump():
  f = open('data.txt','w')
  page = 1
  issues = dict()
  while(True):
    doNext = dump('https://api.github.com/repos/sandz-in/csc510_group_l/issues/events?page=' + str(page), issues)
    print("page "+ str(page))
    f.write("page "+ str(page))
    f.write("\n")
    page += 1
    if not doNext : break
  for issue, events in issues.iteritems():
    print("ISSUE " + str(issue))
    f.write("ISSUE " + str(issue))
    for event in events: print(event.show()) 
    f.write(event.show())
    print('')
    f.write("\n")
  #with open('data.txt', 'w') as outfile: 
   # outfile.write()
    
launchDump()