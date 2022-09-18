import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ResourceInterface, ArrayHelper, ActionInterface, GoogleAnalyticsHelper, VariantInterface, AssetInterface, UserHelper, ApiHelper, FileInterface, ExternalVideoInterface } from "@/utils";
import React from "react";
import { VimeoModal } from "./VimeoModal";

type Props = {
  action: ActionInterface;
  resources: ResourceInterface[];
  externalVideos: ExternalVideoInterface[];
  lessonId: string;
};

export function Action(props: Props) {
  const [showPreview, setShowPreview] = React.useState(false);

  const trackDownload = (variant: VariantInterface) => {
    const resource: ResourceInterface = ArrayHelper.getOne(props.resources, "id", variant.resourceId);
    const action = resource.name + " - " + variant.name;
    const label = window.location.pathname;
    GoogleAnalyticsHelper.gaEvent({ category: "Download", action: action, label: label })
    const download = {
      lessonId: props.lessonId,
      fileId: variant.fileId,
      userId: UserHelper.user?.id || "",
      churchId: UserHelper.currentChurch?.id || "",
      ipAddress: "",
      downloadDate: new Date(),
      fileName: "Variant - " + variant.name
    }
    ApiHelper.post("/downloads", [download], "LessonsApi");
  }

  const trackView = (video: ExternalVideoInterface) => {
    const action = video.name;
    const label = window.location.pathname;
    GoogleAnalyticsHelper.gaEvent({ category: "Download", action: action, label: label })
    const download = {
      lessonId: props.lessonId,
      fileId: "",
      userId: UserHelper.user?.id || "",
      churchId: UserHelper.currentChurch?.id || "",
      ipAddress: "",
      downloadDate: new Date(),
      fileName: "Video - " + video.name
    }
    ApiHelper.post("/downloads", [download], "LessonsApi");
  }

  const trackAssetDownload = (asset: AssetInterface) => {
    const resource: ResourceInterface = ArrayHelper.getOne(props.resources || [], "id", props.action.resourceId);
    const action = resource.name + " - " + asset.name;
    const label = window.location.pathname;
    GoogleAnalyticsHelper.gaEvent({ category: "Download Asset", action: action, label: label })
    const download = {
      lessonId: props.lessonId,
      fileId: asset.fileId,
      userId: UserHelper.user?.id || "",
      churchId: UserHelper.currentChurch?.id || "",
      ipAddress: "",
      downloadDate: new Date(),
      fileName: "Asset - " + asset.name
    }
    ApiHelper.post("/downloads", [download], "LessonsApi");
  }

  const getPreview = (variants: VariantInterface[], asset: AssetInterface, name: string) => {
    let files: FileInterface[] = [];

    variants?.forEach(v => { if (v.file) files.push(v.file) });
    if (asset?.file) files.push(asset.file);
    let result = <></>

    files.forEach(f => {
      if (f?.thumbPath) result = <div className="playPreview"><img src={f.thumbPath} alt={name} /></div>
      else if (f?.fileType === "image/jpeg" || f?.fileType === "image/png") result = <div className="playPreview"><img src={f.contentPath} alt={name} /></div>
    })

    return result;
  }

  const getPlayLink = () => {
    const video: ExternalVideoInterface = ArrayHelper.getOne(props.externalVideos || [], "id", props.action.externalVideoId);
    const resource: ResourceInterface = ArrayHelper.getOne(props.resources || [], "id", props.action.resourceId);
    const asset = (props.action.assetId && resource) ? ArrayHelper.getOne(resource?.assets || [], "id", props.action.assetId) : null;

    if (asset) {
      return (<>
        {getPreview(null, asset, resource.name)}
        <a href={resource.variants[0]?.file?.contentPath} target="_blank" rel="noopener noreferrer" onClick={() => { trackDownload(resource.variants[0]) }} >{resource.name}</a>
        :{" "}
        <a href={asset?.file?.contentPath} target="_blank" rel="noopener noreferrer" onClick={() => { trackAssetDownload(asset) }} >{asset.name}</a>
      </>);
    } else if (resource) {
      return (<>
        {getPreview(resource.variants, null, resource.name)}
        <a href={resource.variants[0]?.file?.contentPath} target="_blank" rel="noopener noreferrer" onClick={() => { trackDownload(resource.variants[0]) }} > {resource.name} </a>
      </>);
    } else if (video) {
      return (<>
        {showPreview && <VimeoModal onClose={() => setShowPreview(false)} vimeoId={video.videoId} />}
        <div className="playPreview">
          <a href={"https://vimeo.com/" + video.videoId} rel="noopener noreferrer" onClick={(e) => { e.preventDefault(); trackView(video); setShowPreview(true); }} >
            <img src={video.thumbnail} alt={video.name} />
          </a>
        </div>
        <a href={"https://vimeo.com/" + video.videoId} rel="noopener noreferrer" onClick={(e) => { e.preventDefault(); trackView(video); setShowPreview(true); }} >{video.name}</a>
      </>);
    }
    return props.action.content;
  };

  let result = <></>;

  switch (props.action.actionType) {
    case "Note":
      result = (<div className="note"><b>Note:</b> <ReactMarkdown remarkPlugins={[remarkGfm]}>{props.action.content}</ReactMarkdown></div>);
      break;
    case "Do":
      result = (<ul className="actions"><li><ReactMarkdown remarkPlugins={[remarkGfm]}>{props.action.content}</ReactMarkdown></li></ul>);
      break;
    case "Say":
      result = (<blockquote><ReactMarkdown remarkPlugins={[remarkGfm]}>{props.action.content}</ReactMarkdown></blockquote>);
      break;
    case "Play":
      result = (<ul className="play"><li><b>Play:</b> {getPlayLink()}</li></ul>);
      break;
  }

  return result;
}
