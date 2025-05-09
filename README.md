# Cipher Breaker API 🔒

A powerful cryptographic tool that automatically detects and breaks various classical ciphers including Caesar, Rail Fence, and Vigenère ciphers.

## Features 🔍

- **Universal Cipher Detection**: Automatically identifies the most likely cipher used in encrypted text
- **Multiple Cipher Support**:
  - Caesar Cipher (all shift variations)
  - Rail Fence Cipher (variable rails)
  - Vigenère Cipher (dictionary-based attack)
- **Intelligent Scoring**: Uses linguistic analysis to evaluate decryption quality
- **RESTful API**: Simple HTTP interface for integration with other applications
- **Enhanced Word Validation**: Utilizes comprehensive dictionaries (Words.json) for accurate decryption
- **Known Key Detection**: Leverages pre-compiled key lists (VK.json) for faster Vigenère breaking

## Technology Stack 🛠️

### Backend

- **Node.js**
- **Express**
- **Natural (NLP library)**
- **Word-list (English dictionary)**

### Frontend

- **Separate Repository**: This API works with a companion [frontend](https://github.com/Abdalla28/IOT) application available in a separate repository 
- **API Integration**: RESTful endpoints for seamless integration

## Getting Started 🚀

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/3bdalrahman/cipher_breaker_api
   cd cipher_breaker_api
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the server

   ```bash
   npm start
   ```

   For development with auto-reload:

   ```bash
   npm run dev
   ```

## API Usage 📡

### Break Cipher

**Endpoint:** `POST /api/break-cipher`

**Request Body:**

```json
{
  "ciphertext": "Your encrypted text here"
}
```

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "method": "Caesar",
      "key": "19",
      "decrypted": "Decrypted text here",
      "normalizedScore": 0.95,
      "additionalInfo": {
        "validWordPercentage": 98.2
      }
    }
    // Additional alternative decryptions...
  ]
}
```

## System Architecture 🏗️

The system is composed of several specialized components:

- **UniversalBreaker**: Coordinates decryption attempts across all cipher types
- **VigenereBreaker**: Specializes in breaking Vigenère ciphers using dictionary attacks
- **CipherBreaker**: Handles Caesar and Rail Fence ciphers

## Dictionary Files 📚

- **Words.json**: Contains a comprehensive list of words for validating decrypted text
- **VK.json**: Contains known Vigenère cipher keys to accelerate the breaking process

## Testing 🧪

You can use the included Postman collection to test the API. For comprehensive testing:

1. Clone both the API and frontend repositories
2. Start the API server using `npm start`
3. Follow the frontend repository's instructions to set up the client application

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Team 👥

Meet the talented developers behind the Cipher Breaker API:

### Abdulrhman Ahmed

- GitHub: [3bdalrahman](https://github.com/3bdalrahman)
- LinkedIn: [Abdulrhman Ahmed](https://www.linkedin.com/in/abdulrhman-ahmed03/)

### Abdalla Gamal

- GitHub: [](https://github.com/)
- LinkedIn: [](https://www.linkedin.com/in//)

### Amr Matarek

- GitHub: [Amr11matarek](https://github.com/Amr11matarek)
- LinkedIn: [Amr Matarek](https://www.linkedin.com/in/amr-matarek-72839b244)

## License 📄

ISC

## Acknowledgments 🙏

- Natural Language Processing community
- Express.js framework
- Node.js development community
- All our beta testers and early adopters

---

Made with ❤️ by the Cipher Breaker Team
