"use client"

import Image from 'next/image'
import { Input, Select, Option, Button } from "./tailwind-clients"
import { useEffect, useState } from 'react'
import { GetRates } from './api'

type Rates = {
  [key: string]: number
}

const ttl = 10 // in minutes

export default function Home() {
  const [rates, setRates] = useState<Rates>({})
  const [amount, setAmount] = useState(0)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [result, setResult] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSelect = (value: string, type: string) => {
    if (type === "from") {
      setFrom(value)
    } else {
      setTo(value)
    }
  }

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      setError("Currency not found")
      return
    }

    const val = (amount / rates[fromCurrency]) * rates[toCurrency]
    setResult(`${val.toFixed(2)} ${toCurrency}`)
  }

  useEffect(() => {
    const method = async () => {
      try {
        setLoading(true)

        const cachedData = localStorage.getItem('exchangeRates')
        
        // check if data is cached and not expired
        if (cachedData) {
          const parsedData = JSON.parse(cachedData)
          const timestamp = localStorage.getItem('exchangeRatesTimestamp')
          const currentTime = new Date().getTime()

          if (timestamp && currentTime - parseInt(timestamp, 10) < ttl * 60 * 1000) {
            setRates(parsedData)
            setLoading(false)
            return
          }
        }

        const data = await GetRates()
        setRates({ ...data.rates })
        localStorage.setItem('exchangeRates', JSON.stringify(data.rates));
        localStorage.setItem('exchangeRatesTimestamp', new Date().getTime().toString());
      } catch (error) {
        setError("Something went wrong")
        console.log(error)
      }
      finally {
        setLoading(false)
      }
    }

    method()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 gap-6">
      <div className="relative flex place-items-center">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/OIP.jpeg"
          alt=""
          width={180}
          height={30}
          priority
        />
      </div>

      <div className="w-72 flex flex-col gap-6">
        <Input label="Amount to convert"
          type="number"
          value={amount}
          onChange={(v) => setAmount(parseFloat(v.target.value))}
          crossOrigin={undefined} />

        <Select label="From" onChange={(v: any) => handleSelect(v, "from")}>
          {
            Object.keys(rates).map((key: string) => (
              <Option key={`${key}-from`} value={key}>{key}</Option>
            ))
          }
        </Select>

        <Select label="To" onChange={(v: any) => handleSelect(v, "to")}>
          {
            Object.keys(rates).map((key: string) => (
              <Option key={`${key}-to`} value={key}>{key}</Option>
            ))
          }
        </Select>

        <Button color="green" onClick={() => convertCurrency(amount, from, to)}>Calculate</Button>

        <span className='text-green-400 text-center text-xl'>{result}</span>
      </div>

      {error && <div className='w-72 flex text-center text-red-600'>
        <span>{error}</span>
      </div>}

      {loading && <div className='w-72 flex align-middle text-green-600'>
        <span>Loading...</span>
      </div>}
    </main>
  )
}
