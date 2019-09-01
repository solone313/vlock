pragma solidity 0.4.25;


contract Voting{
    struct candidate{
        uint upVote;
        string party;
        string name;
    }
    //candidate
    struct voter{
        int right;
        bool voteCheck;
    }
    
    candidate[] public candidateList;
    bool voteAlive;
    address owner;
    //variable
    
    mapping(string => voter) voterlist;

    event AddCandidate(string name,string party);
    event UpVote(string name, uint voteNumber);
    event FinishVote(bool Alive);
    event voteStart(address owner);
    //event

    modifier onlyOwner{
        require(msg.sender == owner);
        _;
    }
    //modifier

    constructor() public{
        owner = msg.sender;
        voteAlive = false;
        emit voteStart(owner);
    }
    //constructor

    function compareString(string a, string b) public returns(bool){
        return keccak256(a) == keccak256(b);
    }
    function signUp(string _id) public returns (bool){
        if(compareString(_id,'admin') == true)
            voterlist[_id] = (voter(1,false));
        else
            voterlist[_id] = (voter(0,false));

        return true;
    }

    function addCandidator(string _id,string _name, string _party) public onlyOwner returns (bool){
        require(voteAlive == false);
        require(voterlist[_id].right == 1);
        candidateList.push(candidate(0,_party,_name));

        emit AddCandidate(_name,_party);
        return true;
        //emit event
    }
    // add candidates

    function startvote(string _id) public onlyOwner returns (bool){
        require(voteAlive == false);
        require(voterlist[_id].right == 1);
        voteAlive = true;
        return true;
    }
    //vote start

    function upVote(string _id, uint _idxnumber) public returns (bool) {
        require(voteAlive == true);
        require(_idxnumber < candidateList.length);
        require(voterlist[_id].voteCheck == false);
        candidateList[_idxnumber].upVote += 1;
        voterlist[_id].voteCheck = true;
        emit UpVote(candidateList[_idxnumber].name,candidateList[_idxnumber].upVote);
        //emit event
        return true;
    }

    // vote


    function finish_Vote(string _id) public onlyOwner returns (bool){
        require(voteAlive == true);
        require(voterlist[_id].right == 1);
        voteAlive = false;

        emit FinishVote(voteAlive);
        return true;

    }
    // finish vote

    function get_votenum(uint _idx) public onlyOwner returns(uint){
        require(voteAlive == false);
        if(_idx < 0 || _idx>candidateList.length)
            return 0;
        return candidateList[_idx].upVote;
    }
}
