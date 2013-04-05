tsc --declaration ./src/Cycle.ts
mv ./src/Cycle.js ./src/Cycle.tmp.js
java -jar compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js ./src/Cycle.tmp.js --js_output_file ./src/Cycle.js
cp ./src/Cycle.js ./sample/js/Cycle.js
rm ./src/Cycle.tmp.js