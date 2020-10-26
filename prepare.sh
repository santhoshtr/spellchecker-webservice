
#!/bin/bash
set -e
set -u
filename='backends/hunspell/dictionaries.json'
n=1
packages=''
while read line; do
# reading each line
if [[ "$line" == *"["* ]]; then
    continue
fi
if [[ "$line" == *"]"* ]]; then
    continue
fi
packages+=$(echo "dictionary-$line " | sed -e 's/\(.*\)/\L\1/' | sed -e 's/\"//g' | sed -e 's/,//g')
done < $filename

npm install --save $packages