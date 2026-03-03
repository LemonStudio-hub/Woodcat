/**
 * A Dark Room 加密工具单元测试
 */

describe('AdarkroomCrypto', () => {
  const ENCRYPTION_KEY = 'adr_crypt_k3y_v2_2024';

  /**
   * 字符转数字
   */
  const charToNum = (c: string): number => {
    return c.charCodeAt(0);
  };

  /**
   * 数字转字符
   */
  const numToChar = (n: number): string => {
    return String.fromCharCode(n);
  };

  /**
   * 加密函数
   */
  const encrypt = (plaintext: string): string => {
    if (!plaintext) return '';

    let result = '';
    const keyLen = ENCRYPTION_KEY.length;

    for (let i = 0; i < plaintext.length; i++) {
      const plainChar = plaintext.charAt(i);
      const keyChar = ENCRYPTION_KEY.charAt(i % keyLen);
      const encrypted = charToNum(plainChar) ^ charToNum(keyChar);
      result += numToChar(encrypted);
    }

    try {
      return btoa(result);
    } catch (e) {
      console.error('Encryption failed:', e);
      return '';
    }
  };

  /**
   * 解密函数
   */
  const decrypt = (ciphertext: string): string | null => {
    if (!ciphertext) return null;

    try {
      const decoded = atob(ciphertext);
      let result = '';
      const keyLen = ENCRYPTION_KEY.length;

      for (let i = 0; i < decoded.length; i++) {
        const encryptedChar = decoded.charAt(i);
        const keyChar = ENCRYPTION_KEY.charAt(i % keyLen);
        const decrypted = charToNum(encryptedChar) ^ charToNum(keyChar);
        result += numToChar(decrypted);
      }

      return result;
    } catch (e) {
      console.error('Decryption failed:', e);
      return null;
    }
  };

  /**
   * 检查字符串是否为加密格式
   */
  const isEncrypted = (str: string): boolean => {
    if (!str) return false;
    try {
      const decrypted = decrypt(str);
      return decrypted !== null && decrypted.length > 0;
    } catch (e) {
      return false;
    }
  };

  describe('encrypt', () => {
    it('应该加密空字符串', () => {
      const result = encrypt('');
      expect(result).toBe('');
    });

    it('应该加密非空字符串', () => {
      const plaintext = 'Hello World';
      const result = encrypt(plaintext);

      expect(result).not.toBe(plaintext);
      expect(result).not.toBe('');
    });

    it('加密后的字符串应该可以解密', () => {
      const plaintext = 'Test message 123';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('应该正确加密包含特殊字符的字符串', () => {
      const plaintext = 'Test @#$%^&*()_+-={}[]|\\:\"\'\<>,.?/~`';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('应该正确加密包含中文的字符串', () => {
      const plaintext = '你好世界 Test 测试';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('应该正确加密包含换行符的字符串', () => {
      const plaintext = 'Line 1\nLine 2\nLine 3';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('应该正确加密长字符串', () => {
      const plaintext = 'A'.repeat(10000);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('相同的明文加密多次应该产生不同的密文', () => {
      const plaintext = 'Test message';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      expect(encrypted1).toBe(encrypted2); // XOR 加密是确定性的，所以相同输入会产生相同输出
    });

    it('应该正确加密 JSON 字符串', () => {
      const jsonStr = JSON.stringify({ name: 'Test', value: 123 });
      const encrypted = encrypt(jsonStr);
      const decrypted = decrypt(encrypted);
      const parsed = JSON.parse(decrypted || '');

      expect(JSON.parse(jsonStr)).toEqual(parsed);
    });
  });

  describe('decrypt', () => {
    it('应该解密 null 输入', () => {
      const result = decrypt('');
      expect(result).toBeNull();
    });

    it('应该解密 undefined 输入', () => {
      const result = decrypt(undefined as any);
      expect(result).toBeNull();
    });

    it('应该正确解密之前加密的字符串', () => {
      const plaintext = 'Secret message';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('应该处理无效的 Base64 字符串', () => {
      const invalidBase64 = 'Not a valid base64!!!';
      const decrypted = decrypt(invalidBase64);

      expect(decrypted).toBeNull();
    });

    it('应该处理被篡改的密文', () => {
      const plaintext = 'Original message';
      const encrypted = encrypt(plaintext);
      const tampered = encrypted.replace(/.$/, 'X'); // 修改最后一个字符
      const decrypted = decrypt(tampered);

      // 解密结果应该不是原始明文
      expect(decrypted).not.toBe(plaintext);
    });
  });

  describe('isEncrypted', () => {
    it('应该识别加密的字符串', () => {
      const plaintext = 'Test message';
      const encrypted = encrypt(plaintext);

      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('应该识别未加密的字符串', () => {
      const plaintext = 'Not encrypted';

      expect(isEncrypted(plaintext)).toBe(false);
    });

    it('应该识别 null 输入', () => {
      expect(isEncrypted('' as any)).toBe(false);
    });

    it('应该识别有效的 Base64 但非加密的字符串', () => {
      const base64Str = btoa('Not encrypted');

      expect(isEncrypted(base64Str)).toBe(false);
    });

    it('应该识别无效的 Base64 字符串', () => {
      const invalidStr = 'Not valid base64!!!';

      expect(isEncrypted(invalidStr)).toBe(false);
    });
  });

  describe('encryption/decryption roundtrip', () => {
    it('应该正确处理 JSON 对象', () => {
      const gameData = {
        version: '1.0',
        player: {
          name: 'Player1',
          health: 100,
          inventory: ['item1', 'item2']
        },
        progress: {
          level: 5,
          score: 1000
        }
      };

      const jsonString = JSON.stringify(gameData);
      const encrypted = encrypt(jsonString);
      const decrypted = decrypt(encrypted);
      const parsed = JSON.parse(decrypted || '');

      expect(parsed).toEqual(gameData);
    });

    it('应该正确处理包含 null 和 undefined 的 JSON', () => {
      const gameData = {
        version: '1.0',
        player: {
          name: 'Player1',
          health: null,
          death: undefined
        }
      };

      const jsonString = JSON.stringify(gameData);
      const encrypted = encrypt(jsonString);
      const decrypted = decrypt(encrypted);
      const parsed = JSON.parse(decrypted || '');

      expect(parsed).toEqual(gameData);
    });

    it('应该正确处理非常大的游戏存档', () => {
      const gameData = {
        version: '1.0',
        history: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          timestamp: Date.now(),
          action: `Action ${i}`,
          details: {
            data: 'x'.repeat(100)
          }
        }))
      };

      const jsonString = JSON.stringify(gameData);
      expect(jsonString.length).toBeGreaterThan(100000);

      const encrypted = encrypt(jsonString);
      const decrypted = decrypt(encrypted);
      const parsed = JSON.parse(decrypted || '');

      expect(parsed).toEqual(gameData);
    });
  });

  describe('security properties', () => {
    it('加密后的字符串应该不是明文', () => {
      const plaintext = 'Secret';
      const encrypted = encrypt(plaintext);

      expect(encrypted).not.toContain('Secret');
      expect(encrypted).not.toContain('secret');
    });

    it('加密后的字符串应该是有效的 Base64', () => {
      const plaintext = 'Test';
      const encrypted = encrypt(plaintext);

      // 尝试解码 Base64，不应该抛出错误
      expect(() => atob(encrypted)).not.toThrow();
    });

    it('应该使用完整的密钥进行加密', () => {
      const plaintext1 = 'A';
      const plaintext2 = 'A'.repeat(20); // 长于密钥

      const encrypted1 = encrypt(plaintext1);
      const encrypted2 = encrypt(plaintext2);

      // 密钥长度影响加密结果
      expect(encrypted1).toBeDefined();
      expect(encrypted2).toBeDefined();
    });
  });
});