
function qualityScore(quality){
    if(!quality) return 0
    return parseInt(quality) || 0

}

function attachStreams(channels , streams){
    if(!Array.isArray(channels) || !Array.isArray(streams)){
        return{
            status:400,
            ok:false,
            error:"Both input must be an array !"
        }
    }
   const channelIds = new Set(channels.map(ch => ch.id));
   const validStreams = streams.filter(s =>
    s && typeof s === "object" &&
    channelIds.has(s.channel) &&
    typeof s.url === "string" &&
    (s.url.startsWith("http://") || s.url.startsWith("https://"))
  );
  const streamMap = new Map()
  for(const s of validStreams){
    if(!streamMap.has(s.channel)) streamMap.set(s.channel, [])
     streamMap.get(s.channel).push({ url: s.url, quality: s.quality });
  }
   const data = channels
    .filter(ch => streamMap.has(ch.id))
    .map(ch => ({ ...ch, streams: streamMap.get(ch.id) }));

   for(const ch of data){
    ch.streams.sort((a, b) => {
     const aHttps = a.url.startsWith("https://") ? 1 : 0;
     const bHttps = b.url.startsWith("https://") ? 1 : 0;
        if (aHttps !== bHttps) return bHttps - aHttps;
            return qualityScore(b.quality) - qualityScore(a.quality);
});
   }
   return { status: 200, ok: true, data };
}

function attachLogos(channels , logos){
    if(!Array.isArray(channels) || !Array.isArray(logos)){
        return{
            status:400,
            ok:false,
            error:"Both inputs must be an array !"
        }
    }
   const BestlogoMap = new Map() ;
   for(const logo of logos){
    if (!logo || typeof logo !== "object") continue;
    if(typeof logo.channel !== "string" || typeof logo.url !== "string"){
        continue
    }
    if(!BestlogoMap.has(logo.channel)){
        BestlogoMap.set(logo.channel , logo);
        continue
    }
   const current = BestlogoMap.get(logo.channel);
   const newInUse = logo.in_use ? 1 : 0 ;
   const curInUse = current.in_use ? 1 : 0 ;

   let newWin = false ;
    if(newInUse !== curInUse){
        newWin = newInUse > curInUse
    }else{
        newWin = (logo.width || 0) > (current.width ||0)
    }

    if(newWin){
        BestlogoMap.set(logo.channel , logo)
     }
   }
   const data = channels.map(ch =>({
    ...ch,
    logo:BestlogoMap.get(ch.id)?.url || null
   }))
   return {status:200, ok:true , data}
}
module.exports = {
    attachStreams,
    attachLogos
}