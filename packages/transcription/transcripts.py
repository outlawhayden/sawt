from youtube_transcript_api import YouTubeTranscriptApi
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv

os.chdir("packages\\transcription")
load_dotenv("cred\\cred.env")

# Get credentials from environment variables
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
GOOGLE_APPLICATION_CREDENTIALS= os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS


'''
    From a playlist, get all the video ids in the playlist and then download the transcripts for each video.

    Currently doesn't fully work -- need some Oauth stuff. Currently, just using a generic playlist on my personal.
    
    The idea rn is to place all the videos on the https://www.youtube.com/@neworleanscitycouncil488 in 
    a playlist on my personal YouTube account.

    Then we can use this to get the video ids and download the transcripts.

    We'll also need to figure out how to get all of the videos in a playlist (non-manually)

'''

def get_video_ids(playlist_id):
    # generic Youtube API client
    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY,)
    
    request = youtube.playlistItems().list(
        part="contentDetails",
        maxResults=200,
        playlistId=playlist_id
    )
    response = request.execute() # Ez API http request
    
    video_ids = [item['contentDetails']['videoId'] for item in response['items']]
    
    return video_ids

def download_transcripts(video_ids):
    for video_id in video_ids:
        try:
            # Grabs transcript for the video
            transcript = YouTubeTranscriptApi.get_transcript(video_id)

            with open(f'transcripts\\{video_id}_transcript.txt', 'w', encoding='utf-8') as file:
                for entry in transcript:
                    start = entry['start']
                    duration = entry['duration']
                    text = entry['text']
                    file.write(f'Start: {start} Duration: {duration}\nText: {text}\n\n')
            print(f'Transcript for {video_id} saved successfully.')

            
            with open(f'transcripts\\plain_text\\{video_id}_plain_text.txt', 'w', encoding='utf-8') as file:
                for entry in transcript:
  
                    text = entry['text']
                    file.write(f'{text}\n')
            print(f'Plain text transcript for {video_id} saved successfully.')

        except Exception as e:
            print(f'An error occurred while fetching the transcript for {video_id}: {e}')


playlist_id = "PLHbnwZ0jWOeM6Pdpz9s63sDgk_74LaW6p" ## Testing playlist
video_ids = get_video_ids(playlist_id)
download_transcripts(video_ids)