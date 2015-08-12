f = open('spiele','r')
fOut = open('matchdays.json','w+')
fOut.write('{ "matchdays" : [ \n' )

matchdayCounter = 0

lines = f.readlines()

for i,l in enumerate(lines):
	if l.find('Spieltag') != -1:
		matchdayCounter += 1
		continue
	teams = l.split('\t')
	fOut.write('{ "matchday" : %d,\n' % matchdayCounter)
	fOut.write('"teamhome" : "%s",\n' % teams[0].strip())
	fOut.write('"teamguest" : "%s",\n' % teams[1].strip())
	fOut.write('"goalshome" : %d,\n' % -1)
	fOut.write('"goalsguest" : %d }' % -1)
	if i != len(lines) - 1:
		fOut.write(',\n')
	
fOut.write('] }')
fOut.close()