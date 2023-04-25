import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, DataTable } from '../components';
import { useOffersContext } from '../stores';

const columns = [
    {
        name: 'peer',
        label: 'Peer',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'hash',
        label: 'Hash',
        options: {
            filter: false,
        },
    },
    {
        name: 'type',
        label: 'Type',
        options: {
            filter: true,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'amount',
        label: 'Amount',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'price',
        label: 'Price',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
];

export const PairListView = () => {
  const { pathname } = useLocation();
  const { limitOrdersArr } = useOffersContext();
  const [pairOnlyArr, setPairOnlyArr] = useState<any[]>([])
  const pair = pathname.split('/')[2].toUpperCase().replace('-', ' / ');

  useEffect(() => {
    if(limitOrdersArr) {
      const duplicates = limitOrdersArr.filter(obj=> obj.ticker === pair.replaceAll(' ', ''));
      setPairOnlyArr(duplicates);
    }
  }, [limitOrdersArr])

  return (
      <div className="flex flex-col">
        <h2 className="view-header">{pair}</h2>
          <Card>
              <DataTable 
                  title={pair}
                  columns={columns}
                  data={pairOnlyArr}
                  loading={pairOnlyArr.length === 0}
                  type="explore"
              />
          </Card>
      </div>
  );
};
