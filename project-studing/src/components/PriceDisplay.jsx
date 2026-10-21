import { formatKgs } from '../data/zooData.js'

export default function PriceDisplay({ amount, language, suffix = 'KGS' }) {
  return <>{formatKgs(amount, language)} <small>{suffix}</small></>
}
