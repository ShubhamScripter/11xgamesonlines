useEffect(() => {
        const fetchLiveStreamUrl = async () => {
          if (!gameid || !key) return;
    
          setIsLoadingStream(true);
          try {
            const response = await axios.get(
              'https://bulkapi.co.in/api/v1/live-stream',
              {
                params: {
                  key: key,
                  gmid: gameid,
                },
              }
            );
    
            // Extract URL from response - adjust based on actual API response structure
            if (response?.data?.url) {
              setLiveStreamUrl(response.data.url);
            } else if (response?.data?.data?.url) {
              setLiveStreamUrl(response.data.data.url);
            } else if (typeof response?.data === 'string') {
              setLiveStreamUrl(response.data);
            }
          } catch (error) {
            console.error('Error fetching live stream URL:', error);
            // Fallback to default URL if API fails
            setLiveStreamUrl(`https://bulkapi.co.in/api/v1/live-stream?gmid=${gameid}&key=${key}`);
          } finally {
            setIsLoadingStream(false);
          }
        };
    
        fetchLiveStreamUrl();
      }, [gameid, key]);
    <div className='w-full'>
                    {isLoadingStream ? (
                      <div className='flex h-[50vh] w-full items-center justify-center bg-gray-200'>
                        <span>Loading stream...</span>
                      </div>
                    ) : (
                      <iframe
                        src={liveStreamUrl || `https://bulkapi.co.in/api/v1/live-stream?gmid=${gameid}&key=${key}`}
                        title='Watch Live'
                        className='w-full'
                        style={{ height: '50vh' }}
                        allowFullScreen
                        loading='lazy'
                        allow='
                        autoplay;
                        encrypted-media;
                        fullscreen;
                        picture-in-picture;
                        accelerometer;
                        gyroscope
                      '
                      />
                    )}
                  </div>