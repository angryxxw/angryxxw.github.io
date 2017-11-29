import sys
import datetime
import os

fname = 'index.html'
now = datetime.datetime.now()
line = '<p>%s</p>\n' % (now)
with open(fname, 'a') as f:
  f.write(line)
