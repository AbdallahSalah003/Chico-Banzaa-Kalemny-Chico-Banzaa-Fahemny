class MatchChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"
    # sami sends params[:match_id] when connecting 
    stream_from "match_#{params[:match_id]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
