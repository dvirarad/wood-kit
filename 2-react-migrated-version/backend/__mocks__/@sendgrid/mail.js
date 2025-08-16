// Mock for @sendgrid/mail
const mockSgMail = {
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([
    {
      statusCode: 202,
      body: '',
      headers: {}
    }
  ]),
  sendMultiple: jest.fn().mockResolvedValue([
    {
      statusCode: 202,
      body: '',
      headers: {}
    }
  ])
};

module.exports = mockSgMail;