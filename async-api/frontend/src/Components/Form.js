import withAsyncFetch from './withAsyncFetch';
import { useState } from 'react';

function Form({ asyncFetch }) {
  const [ waitFor, setWaitFor ] = useState(0);
  const [ waited, setWaited ] = useState();

  const onWaitForChange = (e) => {
    setWaitFor(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setWaited();

    const response = await asyncFetch({
      domain: 'http://localhost:3000',
      path: '/heavy',
      method: 'POST',
      body: {
        waitFor,
      }
    });

    setWaited(response.waited);
  };

  return (
    <>
      {
        waited && <div>Processed for { waited }</div>
      }
      <form onSubmit={onSubmit}>
        Wait for: <input type='number' name='waitFor' onChange={onWaitForChange}/>
        <input type='submit' />
      </form>
    </>
  );
};

export default withAsyncFetch(Form);
