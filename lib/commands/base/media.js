import ytdlCoreDiscord from 'ytdl-core-discord'
import ytdl from 'ytdl-core'

import { Command } from 'discord.js-commando'

let dispatcher
let connection
let isPlaying = false
let playlist = []

const joinLeaveVoiceChannel = (message, command) => {
  if (command === 'join') {
    message.say('Hello !')
    return message.member.voiceChannel.join()
  }
  if (command === 'leave') {
    message.say('Good Bye !')
    if (typeof dispatcher !== 'undefined') {
      dispatcher.destroy()
    }
    playlist = []
    return message.member.voiceChannel.leave()
  }
}

const generateEmbedMediaCard = datas => {
  return new Promise((resolve, reject) => {
    const embedMediaCard = {
      color: 0x0099ff,
      title: datas.title,
      url: datas.videoUrl,
      author: {
        name: datas.name,
        icon_url: datas.avatar,
        url: datas.profileUrl
      },
      thumbnail: {
        url: datas.thumbnail
      },
      timestamp: datas.timeAdded,
      footer: {
        text: `This song are added by: ${datas.addedBy}`
      }
    }

    resolve(embedMediaCard)
  })
}

const getMediaData = (message, videoUrl) => {
  return ytdl.getBasicInfo(videoUrl).then(info => {
    playlist.push({
      name: info.author.name,
      profileUrl: info.author.channel_url,
      avatar: info.author.avatar,
      title: info.player_response.videoDetails.title,
      thumbnail: info.player_response.videoDetails.thumbnail.thumbnails.slice(
        -1
      )[0].url,
      videoUrl: videoUrl,
      length: info.player_response.videoDetails.lengthSeconds,
      addedBy: message.author.username,
      timeAdded: new Date()
    })
    if (playlist.length >= 1 && isPlaying === true) {
      message.reply(
        `Your song ${
          info.player_response.videoDetails.title
        } are added to the playlist`
      )
    }
  })
}

const playMedia = async (message, datas) => {
  const stream = ytdlCoreDiscord(datas.videoUrl, {
    filter: 'audioonly'
  })
  if (typeof dispatcher !== 'undefined') {
    isPlaying = false
    dispatcher.destroy()
  }
  if (connection === undefined) {
    connection = await joinLeaveVoiceChannel(message, 'join')
  }
  dispatcher = await connection.playOpusStream(await stream, {
    seek: 0,
    volume: 1
  })
  isPlaying = true

  console.log('>>> playlist :', playlist)

  const profile = await generateEmbedMediaCard(datas)
  await message.embed(profile)
  await playlist.shift()
  dispatcher.once('end', function () {
    message.reply('Play finished')
    if (playlist.length > 0) {
      return playMedia(message, playlist[0])
    }
  })
}

export default class MediaPlayerCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'media',
      aliases: [],
      group: 'base',
      memberName: 'media',
      description: 'Play a youtube video',
      details: 'play a video',
      args: [
        {
          key: 'subCommand',
          prompt: 'Add a sub command (play, queue) or a video ID',
          type: 'string'
        },
        {
          key: 'videoID',
          prompt: 'Youtube Video ID to play/pause/stop on a voice Channel',
          type: 'string',
          default: ''
        }
        // {
        //   key: 'play',
        //   prompt: 'play youtube video',
        //   type: 'string'
        // }
      ]
    })
  }

  async run (msg, args) {
    const videoUrl = `https://www.youtube.com/watch?v=${args.videoID}`
    // console.log('>>> msg args :', msg, args)
    // console.log('>>> msg :', msg)
    // console.log('>>> args :', args)

    if (args.subCommand === 'join') {
      joinLeaveVoiceChannel(msg, 'join')
    }

    if (args.subCommand === 'leave') {
      joinLeaveVoiceChannel(msg, 'leave')
    }

    if (args.subCommand === 'play') {
      if (playlist.length === 0 && args.videoID !== '' && isPlaying === false) {
        getMediaData(msg, videoUrl).then(() => {
          playMedia(msg, playlist[0])
        })
      } else if (playlist.length === 0 && args.videoID !== '' && isPlaying === true) {
        getMediaData(msg, videoUrl)
      } else if (playlist.length === 0 && args.videoID === '') {
        msg.reply(`Nothing in queue and no ID was added`)
      }
    }

    if (args.subCommand === 'queue') {
      getMediaData(msg, videoUrl).then(() => {
        msg.reply(`There is ${playlist.length} songs in the queue`)
      })
    }

    if (args.subCommand === 'playlist') {
      playlist.forEach((song, index) => {
        msg.reply(`${index + 1} Name: ${song.name} Title: ${song.title}`)
      })
    }

    if (args.subCommand === 'pause') {
      dispatcher.pause()
    }

    if (args.subCommand === 'next') {
      dispatcher.end()
      if (playlist.length === 0) {
        msg.reply(`Nothing to play in queue`)
      }
      // playMedia(msg, playlist[0])
    }

    if (args.subCommand === 'resume') {
      dispatcher.resume()
    }

    if (args.subCommand === 'stop') {
      isPlaying = false
      dispatcher.destroy()
    }
  }
}