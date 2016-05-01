from __future__ import print_function
import urllib2
import json
import re,datetime
import sys
import json,csv

 
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

def dumpIssues1(u,issues, token):
  request = urllib2.Request(u, headers={"Authorization" : "token "+token})
  v = urllib2.urlopen(request).read()
  w = json.loads(v)
  if not w: return False
  for event in w:
    issue_id = event['issue']['number']
    created_at = event['created_at']
    action = event['event']
    if not event.get('label'):
      label_name='Null label'
    else:
      label_name = event['label']['name']
    user = event['actor']['login']
    milestone = event['issue']['milestone']
    if milestone != None : milestone = milestone['title']
    assignea=event['issue']['assignee']
    assignee=None
    if assignea!=None: assignee=assignea['login']
    comments=event['issue']['comments']
    #issuecreated_at=secs(event['issue']['created_at'][:-1])
    #issueclosed_at=secs(event['issue']['closed_at'][:-1])
    #duration= issueclosed_at-issuecreated_at
    issuecreated_at=secs(event['issue']['created_at'])
    issueclosed_at=event['issue']['closed_at']
    if not issueclosed_at:
      issueclosed_at = 0
      duration= issuecreated_at 
    else: 
      duration= secs(issueclosed_at)-issuecreated_at
    eventObj = L(when=created_at,
                 action = action,
                 what = label_name,
                 user = user,
                 milestone = milestone,
                 assignee=assignee,
                 comments=comments,
                 issuecreated_at=issuecreated_at,		
                 issueclosed_at=issueclosed_at,
                 duration=duration)
    all_events = issues.get(issue_id)
    if not all_events: all_events = []
    all_events.append(eventObj)
    issues[issue_id] = all_events
  return True
  
def dumpCommit1(u,commits,token):
  request = urllib2.Request(u, headers={"Authorization" : "token "+token})
  v = urllib2.urlopen(request).read()
  w = json.loads(v)
  if not w: return False
  for commit in w:
    sha = commit['sha']
    user = commit['author']['login']
    time = secs(commit['commit']['author']['date'])
    message = commit['commit']['message']
    commitObj = L(sha = sha,
                user = user,
                time = time,
                message = message)
    commits.append(commitObj)
  return True
  
def dumpMilestone1(u, milestones, token):
  request = urllib2.Request(u, headers={"Authorization" : "token "+token})
  v = urllib2.urlopen(request).read()
  w = json.loads(v)
  if not w or ('message' in w and w['message'] == "Not Found"): return False
  for milestone in w:
    identifier = milestone['id']
    milestone_id = milestone['number']
    milestone_title = milestone['title']
    milestone_description = milestone['description']
    created_at = secs(milestone['created_at'])
    due_at_string = milestone['due_on']
    due_at = secs(due_at_string) if due_at_string != None else due_at_string
    closed_at_string = milestone['closed_at']
    closed_at = secs(closed_at_string) if closed_at_string != None else closed_at_string
    user = milestone['creator']['login']
    
    milestoneObj = L(ident=identifier,
                  m_id = milestone_id,
                  m_title = milestone_title,
                  m_description = milestone_description,
                  created_at=created_at,
                  due_at = due_at,
                  closed_at = closed_at,
                  user = user)
    milestones.append(milestoneObj)
  return True

  
def dumpComments1(u, comments, token):
  request = urllib2.Request(u, headers={"Authorization" : "token "+token})
  v = urllib2.urlopen(request).read()
  w = json.loads(v)
  if not w: return False
  for comment in w:
    user = comment['user']['login']
    identifier = comment['id']
    issueid = int((comment['issue_url'].split('/'))[-1])
    comment_text = comment['body']
    created_at = secs(comment['created_at'])
    updated_at = secs(comment['updated_at'])
    commentObj = L(ident = identifier,
                issue = issueid, 
                user = user,
                text = comment_text,
                created_at = created_at,
                updated_at = updated_at)
    comments.append(commentObj)
  return True

def dumpIssues(u,issues,token):
  try:
    return dumpIssues1(u, issues,token)
  except Exception as e: 
    print(e)
    print("Contact TA")
    return False

def dumpCommit(u,commits, token):
  try:
    return dumpCommit1(u,commits,token)
  except Exception as e: 
    print(u)
    print(e)
    print("Contact TA")
    return False

def dumpMilestone(u,milestones,token):
  try:
    return dumpMilestone1(u, milestones,token)
  except urllib2.HTTPError as e:
    if e.code != 404:
      print(e)
      print("404 Contact TA")
    return False
  except Exception as e:
    print(u)
    print(e)
    print("other Contact TA")
    return False
    
def dumpComments(u,comments, token):
  try:
    return dumpComments1(u,comments,token)
  except Exception as e: 
    print(u)
    print(e)
    print("Contact TA")
    return False

def launchDump():
  #repo = "shivamgulati1991/CSC510-SE-group-i"
  #repo = "moharnab123saikia/CSC510-group-f"
  repo = "nikraina/CSC510-Group-M"
  token = "dc611469822242e50d476788d595317d85c69f9c"

#issues  
  page = 1
  issues = dict()
  while(True):
    url = 'https://api.github.com/repos/'+repo+'/issues/events?page=' + str(page)
    doNext = dumpIssues(url, issues, token)
    print("issue page "+ str(page))
    page += 1
    if not doNext : break

#commits
#  page = 1
#  commits = []
#  while(True):
#    url = 'https://api.github.com/repos/'+repo+'/commits?page=' + str(page)
#    doNext = dumpCommit(url, commits, token)
#    print("commit page "+ str(page))
#    page += 1
#    if not doNext : break

#milestones
#  page = 1
#  milestones = []
#  while(True):
#    url = 'https://api.github.com/repos/'+repo+'/milestones/' + str(page)
#    doNext = dumpMilestone(url, milestones, token)
#    print("milestone "+ str(page))
#    page += 1
#    if not doNext : break
 
#comments    
#  page = 1
#  comments = []
#  while(True):
#    url = 'https://api.github.com/repos/'+repo+'/issues/comments?page='+str(page)
#    doNext = dumpComments(url, comments , token)
#    print("comments page"+ str(page))
#    page += 1
#    if not doNext : break

#issues	
  f = open('.\Group_M\data_issues_group_m.txt','w')
  for issue, events in issues.iteritems():
    print("ISSUE " + str(issue))
    f.write("ISSUE " + str(issue)+"\n")
    for event in events: print(event.show()) 
    f.write(event.show()+"\n")
    print('')
    f.write("\n")
  f.close() 

#commits  
#  f = open('.\Group_L\data_commits_group_l.txt','w')
#  for commit in commits:
#     print(commit.show())
#     f.write(commit.show()+"\n")
#     print('') 
#     f.write("\n")
#  f.close()
# 
##milestones 
#  f = open('.\Group_L\data_milestones_group_l.txt','w')
#  for milestone in milestones:
#     print(milestone.show())
#     f.write(milestone.show()+"\n")
#     print('') 
#     f.write("\n")
#  f.close()
  
#comments   
#  f = open('.\Group_L\data_comments_group_l.txt','w')
#  for comment in comments:
#     print(comment.show())
#     f.write(comment.show()+"\n")
#     print('') 
#     f.write("\n")
#  f.close()
 
  
  
  
launchDump()# -*- coding: utf-8 -*-

