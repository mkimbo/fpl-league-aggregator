"use client"
import { useState } from 'react';
import {getLeagueTable} from './actions'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  leagueId: z.string().min(1, "League ID is required"),
  startGameweek: z
    .string()
    .min(1, "Start gameweek is required")
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 38, "Gameweek must be between 1 and 38"),
  endGameweek: z
    .string()
    .min(1, "End gameweek is required")
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 38, "Gameweek must be between 1 and 38"),
})

type FormValues = z.infer<typeof formSchema>



export default function Home() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[] | null>(null);
  const [gameweeks, setGameweeks] = useState<string[]>([]);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leagueId: "1641599",
    },
  })

  async function onSubmit(data: FormValues) {
    console.log("Form submitted:", data)
    // Handle form submission here
    const {leagueId, startGameweek, endGameweek } = data
      setLoading(true);
   
  
      const startGw = startGameweek;
      const endGw = endGameweek;

      try {
        const response = await getLeagueTable({ leagueId, startGw, endGw }) 

        
        const result = response;
        setData(result);
        
        // Generate gameweek columns
        const gws = [];
        for (let gw = startGw; gw <= endGw; gw++) {
          gws.push(`GW${gw}`);
        }
        setGameweeks(gws);
      } catch (error: any) {
        alert('Error fetching data: ' + error.message);
      } finally {
        setLoading(false);
      }
  }


  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Wanyamwezi Master League Aggregator</h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full ">
                

                <div className="flex flex-col md:flex-row gap-4 md:items-end">
                  <FormField
                    control={form.control}
                    name="leagueId"
                    render={({ field }) => (
                      <FormItem className="flex-1 pointer-events-none">
                        <FormLabel>League ID</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  /> 
                
                  <FormField
                    control={form.control}
                    name="startGameweek"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Start Gameweek</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min={1} max={38} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endGameweek"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>End Gameweek</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min={1} max={38} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600">
                  Get Points Table
                  </Button>
                </div>

                
              </form>
            </Form>
        
       

        {loading && (
          <div className="text-center text-gray-600 mt-10">
            Loading data...
          </div>
        )}

        {data && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Team Name</th>
                  {gameweeks.map(gw => (
                    <th key={gw} className="px-4 py-2 text-center">{gw}</th>
                  ))}
                  <th className="px-4 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 border-t">{row.name}</td>
                    <td className="px-4 py-2 border-t">{row.team_name}</td>
                    {gameweeks.map(gw => (
                      <td key={gw} className="px-4 py-2 border-t text-center">
                        {row[gw] || '-'}
                      </td>
                    ))}
                    <td className="px-4 py-2 border-t text-center font-bold">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
