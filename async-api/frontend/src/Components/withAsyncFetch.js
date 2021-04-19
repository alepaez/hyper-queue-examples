import { useCallback, useState } from 'react';

function WithAsyncFetch(Component) {
  function AsyncFetch() {
    const [ loading, setLoading ] = useState(false);

    const callApi = (domain, path, method, body = {}) => {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if(['POST', 'PUT'].includes(method)) {
        options.body = JSON.stringify(body);
      };

      return fetch(`${domain}${path}`, options).then(response => response.json());
    };

    const asyncFetch = useCallback(async ({ domain, path, body = {}, method }) => {
      return new Promise(async (resolve, reject) => {
        setLoading(true);
        let pooling;

        try {
          const { requestID, returnPath } = await callApi(domain, path, method, body);

          pooling = setInterval(async () => {
            const response = await callApi(domain, returnPath, 'GET');
            if(response.status === 'finished') {
              clearInterval(pooling);
              setLoading(false);
              resolve(response);
            }
          }, 1000);

        } catch (e) {
          console.log(e);
          clearInterval(pooling);
          reject(e);
        }
      });
    }, []);

    return (
      <>
        {
        loading && <div>Loading... </div>
        }
        <Component asyncFetch={asyncFetch} />
      </>
    );
  };

  return AsyncFetch;
};

export default WithAsyncFetch;
