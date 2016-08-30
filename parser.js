// Generated by CoffeeScript 1.10.0
(function() {
  var FoundHeader, fs, headers, start, toHex;

  fs = require('fs');

  console.log('lk.bin parser');

  console.log('By F6CF and VITEK999');

  start = (new Date).getTime();

  headers = {
    ili_9806_e: [0xFF, 0x00, 0x00, 0x00, 0x05, 0xFF, 0x98, 0x06, 0x04, 0x01],
    otm_8009_a: [0xFF, 0x00, 0x00, 0x00, 0x03, 0x80, 0x09, 0x01],
    otm_f: [0xC0, 0x00, 0x00, 0x00, 0x05, 0x00, 0x58, 0x00, 0x14, 0x16],
    otm_1283_a: [0xFF, 0x00, 0x00, 0x00, 0x03, 0x12, 0x83, 0x01],
    otm_9605_a: [0xFF, 0x00, 0x00, 0x00, 0x03, 0x96, 0x05, 0x01],
    otm_9608_a: [0xFF, 0x00, 0x00, 0x00, 0x03, 0x96, 0x08, 0x01],
    hx_8394: [0xB9, 0x00, 0x00, 0x00, 0x03, 0xFF, 0x83, 0x94],
    hx_8392: [0xB9, 0x00, 0x00, 0x00, 0x03, 0xFF, 0x83, 0x92],
    ili_9881_c: [0xFF, 0x00, 0x00, 0x00, 0x03, 0x98, 0x81, 0x03]
  };

  FoundHeader = (function() {
    function FoundHeader(name, offset1, hex) {
      this.name = name;
      this.offset = offset1;
      this.hex = hex;
    }

    FoundHeader.prototype.toString = function() {
      return "Header of " + this.name + " on 0x" + (this.offset.toString(16));
    };

    FoundHeader.prototype.getEnd = function() {
      return this.offset + this.hex.length - (this.hex.length - 8);
    };

    return FoundHeader;

  })();

  toHex = function(int) {
    var a;
    if (int === void 0) {
      return void 0;
    }
    a = int.toString(16);
    if (a.length === 1) {
      a = "0" + a;
    }
    return "0x" + a;
  };

  fs.readFile('lk.bin', function(err, file) {
    var byte, checkHeader, finish, found, foundHeaders, header, hid, i, id, l, ref;
    if (err) {
      throw err;
    }
    finish = (new Date).getTime();
    console.log("fs.readFile took " + (finish - start) + " ms");
    console.log("Binary size is " + file.length);
    console.log('Starting search of headers...');
    foundHeaders = [];
    for (i = l = 0, ref = file.length; 0 <= ref ? l <= ref : l >= ref; i = 0 <= ref ? ++l : --l) {
      if (i % 10000 === 0) {
        process.stdout.write("Processed " + (Math.round(i * 100 / file.length)) + "%\r");
      }
      byte = function(sym) {
        return file[i + sym];
      };
      checkHeader = function(header) {
        var correct, h, m, ref1;
        correct = true;
        for (h = m = 0, ref1 = header.length - 1; 0 <= ref1 ? m <= ref1 : m >= ref1; h = 0 <= ref1 ? ++m : --m) {
          if (i + h > file.length - 1) {
            return false;
          }
          if (file[i + h] !== header[h]) {
            correct = false;
          }
        }
        return correct;
      };
      for (header in headers) {
        found = checkHeader(headers[header]);
        if (found) {
          found = new FoundHeader(header, i, headers[header]);
          console.log('\n' + found);
          foundHeaders.push(found);
        }
      }
    }
    console.log("\nTotal " + foundHeaders.length + " headers found");
    id = 0;
    hid = 0;
    return foundHeaders.forEach(function(header) {
      var args, data, m, n, o, offset, out, printOffset, processEnd, processStart, processed, read, ref1, ref2, ref3, ref4, skip;
      hid++;
      out = "";
      console.log("Processing header for " + header.name + " (from 0x" + (header.offset.toString(16)) + " to 0x" + (header.getEnd().toString(16)) + ")\n\n\n\n");
      processStart = (new Date).getTime();
      processed = 0;
      offset = header.getEnd();
      finish = false;
      printOffset = function(str) {
        return console.log("0x" + (offset.toString(16)) + ":  " + str);
      };
      skip = function(count) {
        return offset += count;
      };
      read = function(count) {
        var j, k, m, ref1, result;
        result = [];
        k = offset;
        for (j = m = 0, ref1 = count - 1; 0 <= ref1 ? m <= ref1 : m >= ref1; j = 0 <= ref1 ? ++m : --m) {
          result.push(file[k + j]);
        }
        return result;
      };
      skip(64);
      args = [];
      for (n = m = ref1 = header.hex[4] + 2, ref2 = header.hex.length - 1; ref1 <= ref2 ? m <= ref2 : m >= ref2; n = ref1 <= ref2 ? ++m : --m) {
        args.push(header.hex[n]);
      }
      args = args.map(toHex);
      out += "{" + (toHex(header.hex[0])) + ", " + header.hex[4] + ", {" + (args.join(',')) + "}},\n";
      while (!finish || offset < file.length) {
        data = read(8);
        if (data[4] === 0) {
          out += "{REGFLAG_END_OF_TABLE, 0x00, {}}\n";
          processEnd = (new Date).getTime();
          console.log("Table " + hid + " for " + header.name + " processed in " + (processEnd - processStart) + " ms");
          finish = true;
          break;
        }
        id++;
        args = [];
        for (n = o = ref3 = offset + 3 + 1 + 1, ref4 = offset + 3 + data[4] + 1; ref3 <= ref4 ? o <= ref4 : o >= ref4; n = ref3 <= ref4 ? ++o : --o) {
          args.push(file[n]);
        }
        args = args.map(toHex);
        out += "{" + (toHex(data[0])) + ", " + data[4] + ", {" + (args.join(',')) + "}},\n";
        skip(8 + 64);
        finish = true;
      }
      return fs.writeFileSync(header.name + '.' + hid + '.c', out);
    });
  });

}).call(this);
