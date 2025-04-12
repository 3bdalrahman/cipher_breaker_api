# Cipher Breaker API

A powerful cryptographic tool that automatically detects and breaks various classical ciphers including Caesar, Rail Fence, and Vigenère ciphers.

## Features

- **Universal Cipher Detection**: Automatically identifies the most likely cipher used in encrypted text
- **Multiple Cipher Support**:
  - Caesar Cipher (all shift variations)
  - Rail Fence Cipher (variable rails)
  - Vigenère Cipher (dictionary-based attack)
- **Intelligent Scoring**: Uses linguistic analysis to evaluate decryption quality
- **RESTful API**: Simple HTTP interface for integration with other applications

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/cipher_breaker_api.git
cd cipher_breaker_api
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## API Usage

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

## Technologies Used

- Node.js
- Express
- Natural (NLP library)
- Word-list (English dictionary)

## Development

The system architecture consists of several components:

- **UniversalBreaker**: Coordinates decryption attempts across all cipher types
- **VigenereBreaker**: Specializes in breaking Vigenère ciphers using dictionary attacks
- **CipherBreaker**: Handles Caesar and Rail Fence ciphers

## Testing

You can use the included Postman collection to test the API.

## Team

This project was developed by:

- **Abdulrhman Ahmed**
  🔗[GitHub](https://github.com/3bdalrahman) | 🔗[LinkedIn](https://www.linkedin.com/in/abdulrhman-ahmed03/)

- **Abdalla Gamal**
  🔗[GitHub](https://github.com/) | 🔗[LinkedIn](https://www.linkedin.com/in//)
- **Amr Matarek**
  🔗[GitHub](https://github.com/Amr11matarek) | 🔗[LinkedIn](https://www.linkedin.com/in/amr-matarek-72839b244)

## License

ISC
