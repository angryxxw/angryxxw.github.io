import sys
import datetime
import os

fname = 'index.html'
yes_or_no = sys.argv[1][:-1] # always have one strange trailing byte
now = datetime.datetime.now()
line = '<p>%s-%s-%s: %s</p>\n' % (now.year, now.month, now.day, yes_or_no)
with open(fname, 'a') as f:
  f.write(line)
