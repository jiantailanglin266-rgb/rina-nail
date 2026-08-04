/**
 * イントロ動画の「ちらつき防止」用の起動スクリプト。
 *
 * イントロ本体（IntroVideo）はReactの読み込み後にしか描画できないため、
 * それだけだと **HTMLの表示からReactの起動までの一瞬、本文が見えて** しまいます。
 *
 * そこで、HTMLの解析中に同期実行されるインラインスクリプトで
 * 「このタブでイントロを流すか」を先に判定し、流すなら <html> に
 * data-intro 属性を立てて、白い覆い（#intro-boot）を初回描画から表示します。
 * 覆いはCSS（globals.css）で data-intro があるときだけ表示されます。
 *
 * 判定条件は IntroVideo 側の readShouldShow と**必ず一致**させてください。
 * ずれると「覆いだけ出て動画が来ない」「覆い無しで動画が出る」が起きます。
 *
 * 保険: Reactの読み込みに失敗しても本文を塞ぎ続けないよう、
 * 16秒で属性を自動的に外します（IntroVideo 側の15秒より少し長め。
 * 正常時は IntroVideo が起動した時点で覆いを引き取って外します）。
 */

export const INTRO_STORAGE_KEY = "intro-played";

export const introBootScript = `(function(){try{if(new URLSearchParams(location.search).has("intro")||sessionStorage.getItem(${JSON.stringify(INTRO_STORAGE_KEY)})!=="1"){document.documentElement.setAttribute("data-intro","");setTimeout(function(){document.documentElement.removeAttribute("data-intro")},16000)}}catch(e){}})();`;
