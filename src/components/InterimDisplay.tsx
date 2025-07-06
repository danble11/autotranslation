import React from 'react';

const InterimDisplay: React.FC<{ interim: string }> = ({ interim }) =>
  interim ? (
    <div style={{ marginTop: '1rem', fontStyle: 'italic', color: 'gray' }}>
      中間表示: {interim}
    </div>
  ) : null;

export default InterimDisplay;