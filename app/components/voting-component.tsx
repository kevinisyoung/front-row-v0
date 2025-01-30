"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "../supabase-provider"
import { motion, AnimatePresence } from "framer-motion"

const INITIAL_VOTING_PHOTOS = 4 // You can change this const as needed

export default function VotingComponent({ onComplete }: { onComplete: () => void }) {
  const [photos, setPhotos] = useState<any[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const supabase = useSupabase()

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(INITIAL_VOTING_PHOTOS)

    if (data) {
      setPhotos(data)
    }
    if (error) {
      console.error("Error fetching photos:", error)
    }
  }

  const handleVote = async (photoId: number, voteType: boolean) => {
    const { error } = await supabase.from("votes").insert({ photo_id: photoId, vote_type: voteType })

    if (error) {
      console.error("Error submitting vote:", error)
    }

    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    } else {
      onComplete()
    }
  }

  if (photos.length === 0) {
    return <div>Loading...</div>
  }

  const currentPhoto = photos[currentPhotoIndex]

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Vote on Photos</h2>
      <AnimatePresence>
        <motion.div
          key={currentPhoto.id}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.3 }}
          className="relative w-64 h-64"
        >
          <img
            src={currentPhoto.photo_url || "/placeholder.svg"}
            alt="Concert photo"
            className="w-full h-full object-cover rounded-lg"
          />
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handleVote(currentPhoto.id, false)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4"
        >
          Downvote
        </button>
        <button
          onClick={() => handleVote(currentPhoto.id, true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Upvote
        </button>
      </div>
    </div>
  )
}

