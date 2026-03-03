/**
 * 简单的存档加密工具
 * 使用 XOR 加密 + Base64 编码
 * 
 * 注意：这不是生产级加密，仅用于防止简单的存档篡改
 * 如需更强的安全性，建议使用 AES 加密
 */

var AdarkroomCrypto = (function() {
	// 加密密钥（混淆后的）
	var ENCRYPTION_KEY = 'adr_crypt_k3y_v2_2024';
	
	// 字符转数字
	var charToNum = function(c) {
		return c.charCodeAt(0);
	};
	
	// 数字转字符
	var numToChar = function(n) {
		return String.fromCharCode(n);
	};
	
	/**
	 * 加密函数
	 * @param {string} plaintext - 明文字符串
	 * @returns {string} 加密后的字符串（Base64 编码）
	 */
	var encrypt = function(plaintext) {
		if (!plaintext) return '';
		
		var result = '';
		var keyLen = ENCRYPTION_KEY.length;
		
		for (var i = 0; i < plaintext.length; i++) {
			var plainChar = plaintext.charAt(i);
			var keyChar = ENCRYPTION_KEY.charAt(i % keyLen);
			var encrypted = charToNum(plainChar) ^ charToNum(keyChar);
			result += numToChar(encrypted);
		}
		
		// Base64 编码
		try {
			return btoa(result);
		} catch (e) {
			console.error('Encryption failed:', e);
			return '';
		}
	};
	
	/**
	 * 解密函数
	 * @param {string} ciphertext - 加密的字符串（Base64 编码）
	 * @returns {string|null} 解密后的明文字符串，失败返回 null
	 */
	var decrypt = function(ciphertext) {
		if (!ciphertext) return null;
		
		try {
			// Base64 解码
			var decoded = atob(ciphertext);
			var result = '';
			var keyLen = ENCRYPTION_KEY.length;
			
			for (var i = 0; i < decoded.length; i++) {
				var encryptedChar = decoded.charAt(i);
				var keyChar = ENCRYPTION_KEY.charAt(i % keyLen);
				var decrypted = charToNum(encryptedChar) ^ charToNum(keyChar);
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
	 * @param {string} str - 要检查的字符串
	 * @returns {boolean} 是否为加密格式
	 */
	var isEncrypted = function(str) {
		if (!str) return false;
		try {
			// 尝试解密，如果成功则认为是加密格式
			var decrypted = decrypt(str);
			return decrypted !== null && decrypted.length > 0;
		} catch (e) {
			return false;
		}
	};
	
	return {
		encrypt: encrypt,
		decrypt: decrypt,
		isEncrypted: isEncrypted
	};
})();