// Basic tests for the YouTube Video Summarizer extension

describe('YouTube Video Summarizer Extension', () => {
  // Test the transcript extraction function
  test('getTranscript should extract transcript from YouTube video', () => {
    // Mock the fetch function
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('watch?v=')) {
        return Promise.resolve({
          text: () => Promise.resolve(`
            {"captionTracks":[{"baseUrl":"https://example.com/transcript","name":{"simpleText":"English"},"languageCode":"en"}]}
          `)
        });
      } else if (url.includes('example.com/transcript')) {
        return Promise.resolve({
          text: () => Promise.resolve(`
            <transcript>
              <text start="0" dur="5">Hello, this is a test transcript.</text>
              <text start="5" dur="5">This is the second line of the transcript.</text>
            </transcript>
          `)
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Mock the DOMParser
    global.DOMParser = jest.fn().mockImplementation(() => {
      return {
        parseFromString: jest.fn().mockImplementation(() => {
          return {
            getElementsByTagName: jest.fn().mockImplementation(() => {
              return [
                { textContent: 'Hello, this is a test transcript.' },
                { textContent: 'This is the second line of the transcript.' }
              ];
            })
          };
        })
      };
    });

    // Import the content script
    const getTranscript = require('../extension/content').getTranscript;

    // Call the function and check the result
    return getTranscript().then(transcript => {
      expect(transcript).toBe('Hello, this is a test transcript. This is the second line of the transcript.');
    });
  });

  // Test the summarization function
  test('summarizeTranscript should generate a summary from transcript', async () => {
    // Mock the Gemini API
    jest.mock('@google/generative-ai', () => {
      return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
          return {
            getGenerativeModel: jest.fn().mockImplementation(() => {
              return {
                startChat: jest.fn().mockImplementation(() => {
                  return {
                    sendMessage: jest.fn().mockImplementation(() => {
                      return Promise.resolve({
                        response: {
                          text: () => '- Summary point 1\n- Summary point 2\n- Summary point 3\n- Summary point 4\n- Summary point 5'
                        }
                      });
                    })
                  };
                })
              };
            })
          };
        })
      };
    });

    // Import the summarizer
    const { summarizeTranscript } = require('../backend/summarizer');

    // Call the function and check the result
    const summary = await summarizeTranscript('Test transcript', 'Test title');
    expect(summary).toContain('Summary point 1');
    expect(summary.split('\n').length).toBe(5);
  });
});
