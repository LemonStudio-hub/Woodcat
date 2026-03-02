/**
 Module for triggering marketing messages
 @author mtownsend
 @since Jan 2021
*/

Events.Marketing = [{
  /* Play Penrose! */
  title: _('Penrose'),
  isAvailable: () => !$SM.get('marketing.penrose'),
  scenes: {
    'start': {
      text: [
        _('令人毛骨悚然的砰砰声和撞击声从四面八方传来。眼前浮现出人类和地点、巨型机械和扭曲线条的幻像。'),
        _('来吧，屈服吧，你们这些不知天高地厚的人类。彻底臣服于我吧！')
      ],
      notification: _('a strange thrumming, pounding and crashing. and then gone.'),
      blink: true,
      buttons: {
        'give in': {
          text: _('屈服'),
          onClick: () => {
            $SM.set('marketing.penrose', true);
          },
          link: 'https://penrose.doublespeakgames.com/?utm_source=adarkroom&utm_medium=crosspromote&utm_campaign=event'
        },
        'ignore': {
          text: _('ignore it'),
          nextScene: 'end'
        }
      }
    }
  },
  audio: AudioLibrary.EVENT_NOISES_INSIDE
}];
